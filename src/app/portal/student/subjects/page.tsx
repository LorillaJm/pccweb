'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { subjectsApi, materialsApi, ClassSection, ClassMaterial } from '@/lib/api';
import { BookOpen, Users, Clock, MapPin, FileText, Download, Calendar } from 'lucide-react';

export default function StudentSubjects() {
  const [enrolledSubjects, setEnrolledSubjects] = useState<ClassSection[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<ClassSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);
  const [sectionMaterials, setSectionMaterials] = useState<ClassMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      
      // Fetch enrolled subjects
      const enrolledResponse = await subjectsApi.getEnrolledSubjects();
      if (enrolledResponse.success) {
        setEnrolledSubjects(enrolledResponse.data.enrolledSubjects);
      }

      // Fetch available subjects
      const availableResponse = await subjectsApi.getAvailableSubjects();
      if (availableResponse.success) {
        setAvailableSubjects(availableResponse.data.subjects);
      }

    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSectionMaterials = async (sectionId: number) => {
    try {
      setIsLoadingMaterials(true);
      const response = await materialsApi.getSectionMaterials(sectionId);
      if (response.success) {
        setSectionMaterials(response.data.materials);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const handleSubjectClick = (subject: ClassSection) => {
    setSelectedSection(subject);
    fetchSectionMaterials(subject.sectionId);
  };

  const handleDownloadMaterial = async (materialId: number, fileName: string) => {
    try {
      const blob = await materialsApi.downloadMaterial(materialId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const renderSubjectCard = (subject: ClassSection) => (
    <div 
      key={subject.sectionId}
      onClick={() => handleSubjectClick(subject)}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {subject.subjectCode} - {subject.subjectName}
          </h3>
          
          {subject.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {subject.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{subject.facultyName || 'TBA'}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{subject.schedule || 'Schedule TBA'}</span>
            </div>
            
            {subject.room && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{subject.room}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {subject.units} {subject.units === 1 ? 'unit' : 'units'}
              </span>
              
              <span className="text-gray-500">
                Section: {subject.sectionName}
              </span>
            </div>
            
            {subject.materialCount && subject.materialCount > 0 && (
              <div className="flex items-center text-green-600 text-sm">
                <FileText className="h-4 w-4 mr-1" />
                <span>{subject.materialCount} materials</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="student">
      <PortalLayout title="My Subjects">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('enrolled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'enrolled'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Enrolled Subjects ({enrolledSubjects.length})
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'available'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Available Subjects ({availableSubjects.length})
                </button>
              </nav>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subjects List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading subjects...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTab === 'enrolled' ? (
                    enrolledSubjects.length > 0 ? (
                      enrolledSubjects.map(renderSubjectCard)
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>You are not enrolled in any subjects yet.</p>
                      </div>
                    )
                  ) : (
                    availableSubjects.length > 0 ? (
                      availableSubjects.map(renderSubjectCard)
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No available subjects for your current level.</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Subject Details & Materials */}
            <div className="lg:sticky lg:top-8">
              {selectedSection ? (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedSection.subjectCode} - {selectedSection.subjectName}
                    </h3>
                    <p className="text-gray-600 mt-1">Section {selectedSection.sectionName}</p>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Course Materials</h4>
                    
                    {isLoadingMaterials ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading materials...</p>
                      </div>
                    ) : sectionMaterials.length > 0 ? (
                      <div className="space-y-3">
                        {sectionMaterials.map((material) => (
                          <div 
                            key={material.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="bg-blue-100 p-2 rounded mr-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-gray-900 truncate">
                                  {material.title}
                                </h5>
                                {material.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {material.description}
                                  </p>
                                )}
                                <div className="flex items-center mt-1 text-xs text-gray-400">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>
                                    {new Date(material.createdAt).toLocaleDateString()}
                                  </span>
                                  {material.dueDate && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="text-red-600">
                                        Due: {new Date(material.dueDate).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {material.filePath && (
                              <button
                                onClick={() => handleDownloadMaterial(material.id, material.fileName || material.title)}
                                className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            
                            {material.externalUrl && (
                              <a
                                href={material.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Open Link"
                              >
                                <FileText className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No materials available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a subject to view details and materials</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}