'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, Phone, Mail, MapPin, Calendar, FileText, CheckCircle, AlertCircle, Camera, Check, ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NIC } from '@sri-lanka/nic';

/**
 * REGISTRATION SYSTEM DESIGN
 * 
 * This registration form implements a multi-category competition registration system with the following design principles:
 * 
 * USER EXPERIENCE FEATURES:
 * - Progressive form validation with real-time feedback
 * - Category-specific age requirements and field validation
 * - Interactive photo upload with preview functionality
 * - Responsive design with smooth animations
 * - Multi-language support (Sinhala/English)
 * - Clear visual hierarchy and intuitive navigation
 * 
 * VALIDATION ARCHITECTURE:
 * - Client-side validation for immediate feedback
 * - Server-side validation for security
 * - Category-specific requirements (age limits, NIC rules)
 * - File size and format validation
 * - Sri Lankan NIC validation using specialized library
 * 
 * COMPETITION CATEGORIES:
 * - kumara: Main Awurudu Prince (14-29 years)
 * - kumari: Main Awurudu Princess (14-29 years)
 * - sigithi-kumara: Children's Prince (5-10 years) - requires parent NIC
 * - sigithi-kumariya: Children's Princess (5-10 years) - requires parent NIC
 */

interface RegistrationFormData {
  name: string;
  age: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  category: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya';
  image: string;
  nic: string;
  agreement: boolean;
}

interface RegistrationFormErrors {
  name?: string;
  age?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  category?: string;
  image?: string;
  nic?: string;
  agreement?: string;
}

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function RegistrationForm({ onSubmit, isLoading = false }: RegistrationFormProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    category: 'kumara',
    image: '',
    nic: '',
    agreement: false
  });
  
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: RegistrationFormErrors = {};

    if (!formData.name.trim()) newErrors.name = language === 'si' ? ' Name is required' : 'Name is required';
    
    // Fixed age validation logic
    if (!formData.age) {
      newErrors.age = language === 'si' ? 'Age is required' : 'Age is required';
    } else if (formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya') {
      // Sigithi categories: 5-10 years
      if (parseInt(formData.age) < 5 || parseInt(formData.age) > 10) {
        newErrors.age = language === 'si' 
          ? 'Sigithi participants must be between 5-10 years old. Please provide valid age for your child.'
          : 'Sigithi Awurudu participants must be between 5-10 years old. Please provide valid age for your child.';
      }
    } else {
      // Normal categories: 14-29 years
      if (parseInt(formData.age) < 14 || parseInt(formData.age) > 29) {
        newErrors.age = language === 'si' ? 'Age must be between 14-29' : 'Age must be between 14-29';
      }
    }
    
    if (!formData.phone.trim() || !/^(\+94|0)?[1-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = language === 'si' ? 'Valid phone number required' : 'Valid phone number required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'si' ? 'Valid email required' : 'Valid email required';
    }
    
    // SRI LANKAN NIC VALIDATION
    // ====================================
    // Enhanced validation using specialized NIC validation library
    // Ensures compliance with Sri Lankan national ID standards
    const cleanNIC = formData.nic.replace(/\s/g, '').toUpperCase();
    if (!formData.nic.trim()) {
      if (formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya') {
        newErrors.nic = language === 'si' 
          ? 'Please provide your Parent\'s NIC number for Sigithi Awurudu registration.'
          : 'Please provide your Parent\'s NIC number for Sigithi Awurudu registration. ';
      } else {
        newErrors.nic = language === 'si' ? 'NIC number is required' : 'NIC number is required';
      }
    } else if (!NIC.validate(cleanNIC)) {
      if (formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya') {
        // CHILDREN'S COMPETITION: Parent/Guardian NIC allowed
        newErrors.nic = language === 'si' 
          ? 'Invalid NIC format. For Sigithi participants, you may use parent/guardian NIC '
          : 'Invalid NIC format. For Sigithi participants, you may use parent/guardian NIC ';
      } else {
        // ADULT COMPETITIONS: Strict NIC validation
        newErrors.nic = language === 'si' 
          ? 'Please enter a valid Sri Lankan NIC number (old: 123456789V or new: 200112345678)' 
          : 'Please enter a valid Sri Lankan NIC number (old: 123456789V or new: 200112345678)';
      }
    }
    
    if (!formData.address.trim()) newErrors.address = language === 'si' ? 'Address is required' : 'Address is required';
    if (!formData.description.trim()) {
      if (formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya') {
        newErrors.description = language === 'si' 
          ? 'Please describe your child\'s talents and achievements for Sigithi Awurudu competition'
          : 'Please describe your child\'s talents and achievements for Sigithi Awurudu competition';
      } else {
        newErrors.description = language === 'si' ? 'Description is required' : 'Description is required';
      }
    }
    if (!formData.image.trim()) newErrors.image = language === 'si' ? 'Photo is required' : 'Photo is required';
    if (!formData.agreement) newErrors.agreement = language === 'si' ? 'You must agree to terms' : 'You must agree to terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'si' ? 'Image size must be less than 5MB' : 'Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-orange-100"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'si' ? 'Awurudu Registration' : 'Awurudu Registration'}
        </h2>
        <p className="text-gray-600">
          {language === 'si' ? 'Register for the Awurudu competition' : 'Register for the Awurudu competition'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <User className="w-4 h-4" />
            {language === 'si' ? 'Category' : 'Category'} *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.button
              type="button"
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                formData.category === 'kumara'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData(prev => ({ ...prev, category: 'kumara' }))}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{'\ud83d\udc68'}</div>
                <div className="font-semibold">{language === 'si' ? 'Kumara' : 'Kumara'}</div>
                <div className="text-sm opacity-75">{language === 'si' ? 'Prince' : 'Prince'}</div>
              </div>
            </motion.button>

            <motion.button
              type="button"
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                formData.category === 'kumari'
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData(prev => ({ ...prev, category: 'kumari' }))}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{'\ud83d\udc69'}</div>
                <div className="font-semibold">{language === 'si' ? 'Kumari' : 'Kumari'}</div>
                <div className="text-sm opacity-75">{language === 'si' ? 'Princess' : 'Princess'}</div>
              </div>
            </motion.button>

            <motion.button
              type="button"
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                formData.category === 'sigithi-kumara'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData(prev => ({ ...prev, category: 'sigithi-kumara' }))}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{'\ud83d\udc66'}</div>
                <div className="font-semibold">{language === 'si' ? 'Sigithi Kumara' : 'Sigithi Kumara'}</div>
                <div className="text-sm opacity-75">{language === 'si' ? 'Little Prince' : 'Little Prince'}</div>
              </div>
            </motion.button>

            <motion.button
              type="button"
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                formData.category === 'sigithi-kumariya'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData(prev => ({ ...prev, category: 'sigithi-kumariya' }))}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{'\ud83d\udc67'}</div>
                <div className="font-semibold">{language === 'si' ? 'Sigithi Kumariya' : 'Sigithi Kumariya'}</div>
                <div className="text-sm opacity-75">{language === 'si' ? 'Little Princess' : 'Little Princess'}</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              {language === 'si' ? 'Full Name' : 'Full Name'} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
              placeholder={language === 'si' ? 'Enter your full name' : 'Enter your full name'}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              {language === 'si' ? 'Age' : 'Age'} *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min={formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya' ? '5' : '14'}
              max={formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya' ? '10' : '29'}
              className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.age ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
              placeholder={
                formData.category === 'sigithi-kumara' || formData.category === 'sigithi-kumariya'
                  ? (language === 'si' ? '5-10 years (Child)' : '5-10 years (Child)')
                  : (language === 'si' ? '14-29 years' : '14-29 years')
              }
            />
            {errors.age && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.age}
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              {language === 'si' ? 'Phone' : 'Phone'} *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
              placeholder={language === 'si' ? '+94 XX XXX XXXX' : '+94 XX XXX XXXX'}
            />
            {errors.phone && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              {language === 'si' ? 'Email' : 'Email'} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
              placeholder={language === 'si' ? 'your@email.com' : 'your@email.com'}
            />
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </div>
            )}
          </div>
        </div>

        {/* NIC */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            {language === 'si' ? 'NIC Number' : 'NIC Number'} *
          </label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.nic ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
            placeholder={language === 'si' ? 'XXXXXXXXXV or 200112345678' : 'XXXXXXXXXV or 200112345678'}
          />
          {errors.nic && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
              <AlertCircle className="w-3 h-3" />
              {errors.nic}
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            {language === 'si' ? 'Address' : 'Address'} *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
            placeholder={language === 'si' ? 'Enter your full address' : 'Enter your full address'}
          />
          {errors.address && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
              <AlertCircle className="w-3 h-3" />
              {errors.address}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            {language === 'si' ? 'Description' : 'Description'} *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
            placeholder={language === 'si' ? 'Tell us about yourself, your talents, and why you want to participate...' : 'Tell us about yourself, your talents, and why you want to participate...'}
          />
          {errors.description && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
              <AlertCircle className="w-3 h-3" />
              {errors.description}
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Camera className="w-4 h-4" />
            {language === 'si' ? 'Photo' : 'Photo'} *
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="photo-upload"
            />
            <motion.label
              htmlFor="photo-upload"
              className={`relative block w-full px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
                errors.image 
                  ? 'border-red-400 bg-red-50 hover:border-red-500 hover:bg-red-100' 
                  : 'border-gray-300 bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400 hover:from-orange-50 hover:to-amber-100 hover:shadow-lg'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-2 right-2 w-16 h-16 bg-orange-400 rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-12 h-12 bg-amber-400 rounded-full"></div>
              </div>
              
              <div className="relative text-center">
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-xl"
                      />
                      <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        {language === 'si' ? 'Photo uploaded successfully!' : 'Photo uploaded successfully!'}
                      </p>
                      <p className="text-xs text-orange-600 font-medium">
                        {language === 'si' ? 'Click to change photo' : 'Click to change photo'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-gray-700">
                        {language === 'si' ? 'Upload your photo' : 'Upload your photo'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'si' ? 'Click or drag to upload' : 'Click or drag to upload'}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {language === 'si' ? 'JPG, PNG' : 'JPG, PNG'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {language === 'si' ? 'Max 5MB' : 'Max 5MB'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.label>
            {errors.image && (
              <motion.div 
                className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.image}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="agreement"
            checked={formData.agreement}
            onChange={(e) => setFormData(prev => ({ ...prev, agreement: e.target.checked }))}
            className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label className="text-sm text-gray-600">
            {language === 'si' 
              ? 'I agree to the terms and conditions and confirm that all information provided is accurate.'
              : 'I agree to the terms and conditions and confirm that all information provided is accurate.'
            }
          </label>
        </div>
        {errors.agreement && (
          <div className="flex items-center gap-1 text-red-500 text-sm">
            <AlertCircle className="w-3 h-3" />
            {errors.agreement}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {language === 'si' ? 'Registering...' : 'Registering...'}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {language === 'si' ? 'Complete Registration' : 'Complete Registration'}
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
