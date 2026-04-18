import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/security';
import { uploadImageToCloudinary, validateImage } from '@/lib/cloudinary-storage';
import { NIC } from '@sri-lanka/nic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya' | null;
  const admin = searchParams.get('admin') === 'true';

  try {
    let sql;
    let params;

    if (admin) {
      // Admin sees all candidates regardless of status
      sql = 'SELECT * FROM candidates';
      params = [];
      
      if (category) {
        sql += ' WHERE category = $1';
        params.push(category);
      }
    } else {
      // Public sees only approved candidates
      sql = 'SELECT * FROM candidates WHERE status = $1';
      params = ['approved'];

      if (category) {
        sql += ' AND category = $2';
        params.push(category);
      }
    }

    sql += ' ORDER BY voteCount DESC, registrationDate ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, age, phone, email, address, description, image, nic } = body;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedAddress = sanitizeInput(address);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedNIC = nic ? nic.trim().replace(/\s/g, '').toUpperCase() : '';

    // Validate required fields
    if (!sanitizedName || !category || !age || !sanitizedPhone || !sanitizedEmail || !sanitizedAddress || !sanitizedDescription || !sanitizedNIC) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided including NIC' },
        { status: 400 }
      );
    }

    // Validate category
    if (!['kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate age based on category (Updated requirements)
    if (category === 'sigithi-kumara' || category === 'sigithi-kumariya') {
      // Sigithi categories: 5-10 years
      if (age < 5 || age > 10) {
        return NextResponse.json(
          { success: false, error: 'Sigithi participants must be between 5 and 10 years old' },
          { status: 400 }
        );
      }
    } else {
      // Main categories: 14-29 years
      if (age < 14 || age > 29) {
        return NextResponse.json(
          { success: false, error: 'Age must be between 14 and 29 years old' },
          { status: 400 }
        );
      }
    }

    // Validate email and phone
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePhone(sanitizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate NIC using Sri Lankan NIC validation library
    if (!NIC.validate(sanitizedNIC)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Sri Lankan NIC number format. Please use old format (123456789V) or new format (200112345678)' },
        { status: 400 }
      );
    }

    // Additional NIC validation for Sigithi categories (can use parent/guardian NIC)
    if (category === 'sigithi-kumara' || category === 'sigithi-kumariya') {
      // For Sigithi categories, NIC can be either participant's or parent/guardian's
      // Only basic format validation needed
      console.log('Sigithi category NIC validation passed');
    } else {
      // For main categories, perform additional validation
      // Basic format validation already done above with NIC.validate()
      // Add any additional category-specific checks here if needed
      console.log('Main category NIC validation passed for:', sanitizedNIC);
    }

    // Check if candidate already exists (including NIC for main categories)
    let existingQuery = 'SELECT id FROM candidates WHERE email = $1 OR phone = $2';
    let queryParams = [sanitizedEmail, sanitizedPhone];
    
    // For main categories, also check NIC uniqueness
    if (category === 'kumara' || category === 'kumari') {
      existingQuery += ' OR nic = $3';
      queryParams.push(sanitizedNIC);
    }
    
    const existingCandidate = await query(existingQuery, queryParams);

    if (existingCandidate.rowCount && existingCandidate.rowCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate with this email, phone, or NIC already exists' },
        { status: 409 }
      );
    }

    // Generate candidate ID
    const candidateId = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Handle image upload
    let imageUrl = `/images/default-${category}.jpg`;
    if (image) {
      // Validate image first
      const validation = validateImage(image);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      try {
        imageUrl = await uploadImageToCloudinary(image, category);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image to cloud storage' },
          { status: 500 }
        );
      }
    }

    // Insert new candidate
    const result = await query(`
      INSERT INTO candidates (id, name, category, age, phone, email, address, description, image, nic, registrationDate, status, voteCount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, 'pending', 0)
      RETURNING *
    `, [
      candidateId,
      sanitizedName,
      category,
      age,
      sanitizedPhone,
      sanitizedEmail,
      sanitizedAddress,
      sanitizedDescription,
      imageUrl,
      sanitizedNIC
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Registration submitted successfully. Pending approval.'
    });
  } catch (error) {
    // Comprehensive error logging
    console.error('Registration API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { success: false, error: 'Registration failed: Duplicate information detected' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('violates check constraint')) {
        return NextResponse.json(
          { success: false, error: 'Registration failed: Invalid data provided' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Registration failed: Invalid reference data' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit registration. Please try again later.' },
      { status: 500 }
    );
  }
}
