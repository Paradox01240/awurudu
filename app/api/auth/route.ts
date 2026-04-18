import {NextRequest, NextResponse} from 'next/server';
import {query} from '@/lib/database-clean';
import {verifyAdminAuth} from '@/lib/security';
import crypto from 'crypto';

// Simple authentication middleware for admin access
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'tharushamadushan59@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tharusha@4247';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
    try {
        // Check if admin token exists in cookies
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                {success: false, error: 'Not authenticated'},
                {status: 401}
            );
        }

        // For simplicity, just check if token exists (in production, verify JWT)
        return NextResponse.json({
            success: true,
            message: 'Authenticated'
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            {success: false, error: 'Authentication check failed'},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const {username, password} = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                {success: false, error: 'Username and password are required'},
                {status: 400}
            );
        }

        // Verify credentials
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                {success: false, error: 'Invalid credentials'},
                {status: 401}
            );
        }

        // Generate a simple token (in production, use proper JWT)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Set secure HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                expiresAt: expiresAt.toISOString()
            }
        });

        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {success: false, error: 'Login failed'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logout successful'
        });

        response.cookies.delete('admin_token');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            {success: false, error: 'Logout failed'},
            {status: 500}
        );
    }
}
