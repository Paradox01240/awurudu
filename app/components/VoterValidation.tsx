'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, User, Mail, Phone, CreditCard } from 'lucide-react';

interface VoterValidationProps {
  onValidationComplete: (isValid: boolean, voterInfo: any) => void;
  language: string;
}

export default function VoterValidation({ onValidationComplete, language }: VoterValidationProps) {
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    email: '',
    phone: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors([]);
    setIsValid(null);
  };

  const validateForm = async () => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/validate-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterInfo: formData })
      });

      const result = await response.json();

      if (result.success) {
        setIsValid(true);
        onValidationComplete(true, formData);
      } else {
        setIsValid(false);
        setValidationErrors(result.details || [result.error]);
        onValidationComplete(false, null);
      }
    } catch (error) {
      setValidationErrors(['Validation failed. Please try again.']);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Voter Information
        <span className="block text-xs text-gray-500 mt-1">
          ඡන්දදායක තොරතුරු
        </span>
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
            <span className="block text-xs text-gray-500 mt-1">
              පූර්ණ නම
            </span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address (Optional)
            <span className="block text-xs text-gray-500 mt-1">
              විද්යුත් තැපැල් ලිපිනය (අනිවාර්ය නොවේ)
            </span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter email if available"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
            <span className="block text-xs text-gray-500 mt-1">
              දුරකථන අංකය
            </span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter phone (e.g., 0712345678)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIC Number (Optional)
            <span className="block text-xs text-gray-500 mt-1">
              ජාතික හැඳුනුම්පත් අංකය (අනිවාර්ය නොවේ)
            </span>
          </label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter NIC if available"
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-medium text-red-800">
            Validation Errors:
            <span className="block text-xs text-red-600 mt-1">
              තහවුරු කිරීමේ දෝ෷:
            </span>
          </p>
          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {isValid === true && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-medium text-green-800">
            Validation successful!
            <span className="block text-xs text-green-600 mt-1">
              තහවුරු කිරීම සාර්ථකයි!
            </span>
          </p>
        </div>
      )}


      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm font-medium text-blue-800">
          Required Information
          <span className="block text-xs text-blue-600 mt-1">
            අවශ්ය තොරතුරු
          </span>
        </p>
        <p className="mt-1 text-sm text-blue-700">
          Only Name and Phone are required for voting. Email and NIC are optional.
          <span className="block text-xs text-blue-600 mt-1">
            ඡන්දය සඳහා කේවල නම සහ දුරකථන අංකය පමණක් අවශ්ය වේ. විද්යුත් තැපැල් ලිපිනය සහ ජාතික හැඳුනුම්පත් අංකය අනිවාර්ය නොවේ.
          </span>
        </p>
      </div>

      <button
        onClick={validateForm}
        disabled={isValidating || !formData.name || !formData.phone}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded disabled:cursor-not-allowed"
      >
        {isValidating ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            <span>
              Validating...
              <span className="block text-xs">
                තහවුරු කරමින්...
              </span>
            </span>
          </span>
        ) : (
          <span>
            Validate Information
            <span className="block text-xs">
              තොරතුරු තහවුරු කරන්න
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
