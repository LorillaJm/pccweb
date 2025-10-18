'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PortalLayout } from '@/components/PortalLayout';
import type { StudentProfile } from '@/lib/api';

export default function StudentProfilePage() {
    const { user, profile: studentProfile, refetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        address: '',
        program: '',
        yearLevel: '',
        semester: '',
        gpa: ''
    });

    useEffect(() => {
        if (user) {
            const sp = studentProfile as StudentProfile | null;
            setProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                middleName: user.middleName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                program: sp?.program || '',
                yearLevel: sp?.yearLevel?.toString() || '',
                semester: sp?.semester?.toString() || '',
                gpa: sp?.gpa?.toString() || ''
            });
        }
    }, [user, studentProfile]);

    const handleSave = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            const { api } = await import('@/lib/api');
            
            // Update all profile info in one call
            const response = await api.put('/auth/profile', {
                firstName: profile.firstName,
                lastName: profile.lastName,
                middleName: profile.middleName,
                phone: profile.phone,
                address: profile.address,
                program: profile.program,
                yearLevel: profile.yearLevel ? parseInt(profile.yearLevel) : undefined
            });

            console.log('Profile update response:', response.data);

            setIsEditing(false);
            setSuccess(true);
            
            // Refetch user data from the server
            await refetchUser();
            
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fullName = `${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}`.trim();
    const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase() || 'ST';

    return (
        <PortalLayout title="My Profile">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-32 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white">
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={fullName}
                                        className="w-28 h-28 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pt-20 pb-6 px-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{fullName || 'Student Name'}</h1>
                                <p className="text-slate-600 mt-1">{profile.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                        ID: {user?.id || 'Not Set'}
                                    </Badge>
                                    {profile.yearLevel && (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                            Year {profile.yearLevel}
                                        </Badge>
                                    )}
                                    {profile.program && (
                                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                                            {profile.program}
                                        </Badge>
                                    )}
                                    {profile.gpa && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                            GPA: {profile.gpa}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={loading}
                                            className="border-slate-300 hover:bg-slate-100"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {success && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Profile updated successfully!
                            </div>
                        )}
                    </div>
                </div>

                {/* Personal Information */}
                <Card className="shadow-xl border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                        <CardTitle className="flex items-center text-slate-900">
                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </CardTitle>
                        <CardDescription>Your basic profile details and academic information</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-slate-700 font-semibold">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    disabled={!isEditing}
                                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-slate-700 font-semibold">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    disabled={!isEditing}
                                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middleName" className="text-slate-700 font-semibold">Middle Name</Label>
                                <Input
                                    id="middleName"
                                    value={profile.middleName}
                                    onChange={(e) => setProfile({ ...profile, middleName: e.target.value })}
                                    disabled={!isEditing}
                                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-slate-100 border-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-700 font-semibold">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-slate-700 font-semibold">Address</Label>
                                <Input
                                    id="address"
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    disabled={!isEditing}
                                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Street, City, State, ZIP"
                                />
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900">Academic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="program" className="text-slate-700 font-semibold">Program</Label>
                                    <Input
                                        id="program"
                                        value={profile.program}
                                        onChange={(e) => setProfile({ ...profile, program: e.target.value })}
                                        disabled={!isEditing}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="yearLevel" className="text-slate-700 font-semibold">Year Level</Label>
                                    <Input
                                        id="yearLevel"
                                        type="number"
                                        value={profile.yearLevel}
                                        onChange={(e) => setProfile({ ...profile, yearLevel: e.target.value })}
                                        disabled={!isEditing}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="1-4"
                                        min="1"
                                        max="4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semester" className="text-slate-700 font-semibold">Semester</Label>
                                    <Input
                                        id="semester"
                                        type="number"
                                        value={profile.semester}
                                        onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                                        disabled={!isEditing}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="1 or 2"
                                        min="1"
                                        max="2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gpa" className="text-slate-700 font-semibold">GPA</Label>
                                    <Input
                                        id="gpa"
                                        value={profile.gpa}
                                        disabled
                                        className="bg-slate-100 border-slate-300"
                                        placeholder="Calculated automatically"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </PortalLayout>
    );
}
