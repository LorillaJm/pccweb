'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { subjectsApi, materialsApi, ClassSection, ClassMaterial } from '@/lib/api';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus,
  BookOpen,
  X,
  Link as LinkIcon,
  File
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface MaterialForm {
  title: string;
  description?: string;
  materialType: 'document' | 'video' | 'link' | 'assignment';
  externalUrl?: string;
  dueDate?: string;
  isPublished: boolean;
}

export default function FacultyMaterials() {
  const [assignedSubjects, setAssignedSubjects] = useState<ClassSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);
  const [sectionMaterials, setSectionMaterials] = useState<ClassMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MaterialForm>({
    defaultValues: {
      materialType: 'document',
      isPublished: false
    }
  });

  const materialType = watch('materialType');

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  const fetchAssignedSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await subjectsApi.getAssignedSubjects();
      if (response.success) {
        setAssignedSubjects(response.data.assignedSubjects);
        if (response.data.assignedSubjects.length > 0) {
          const firstSubject = response.data.assignedSubjects[0];
          setSelectedSection(firstSubject);
          fetchSectionMaterials(firstSubject.sectionId);
        }
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

  const handleSectionChange = (section: ClassSection) => {
    setSelectedSection(section);
    fetchSectionMaterials(section.sectionId);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const onSubmit = async (data: MaterialForm) => {
    if (!selectedSection) return;

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('title', data.title);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      formData.append('materialType', data.materialType);
      formData.append('isPublished', String(data.isPublished));
      
      if (data.externalUrl) {
        formData.append('externalUrl', data.externalUrl);
      }
      
      if (data.dueDate) {
        formData.append('dueDate', data.dueDate);
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await materialsApi.uploadMaterial(selectedSection.sectionId, formData);
      
      if (response.success) {
        setSuccess('Material uploaded successfully!');
        reset();
        setSelectedFile(null);
        setShowUploadForm(false);
        fetchSectionMaterials(selectedSection.sectionId);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleMaterialVisibility = async (material: ClassMaterial) => {
    try {
      // This would require an update endpoint in the API
      console.log('Toggle visibility for material:', material.id);
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      // This would require a delete endpoint in the API
      console.log('Delete material:', materialId);
    } catch (error) {
      console.error('Failed to delete material:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="faculty">
      <PortalLayout title="Class Materials">
        <div className="space-y-6">
          {/* Subject Selector */}
          {assignedSubjects.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Class</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedSubjects.map((subject) => (
                  <button
                    key={subject.sectionId}
                    onClick={() => handleSectionChange(subject)}
                    className={`text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedSection?.sectionId === subject.sectionId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">
                      {subject.subjectCode} - {subject.sectionName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{subject.subjectName}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {subject.enrolledStudents} students • {subject.materialCount || 0} materials
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {selectedSection && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Materials List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Materials for {selectedSection.subjectCode} - {selectedSection.sectionName}
                  </h3>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </button>
                </div>

                {isLoadingMaterials ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading materials...</p>
                  </div>
                ) : sectionMaterials.length > 0 ? (
                  <div className="space-y-4">
                    {sectionMaterials.map((material) => (
                      <div key={material.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">{material.title}</h4>
                              <div className="ml-2 flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  material.materialType === 'assignment' ? 'bg-red-100 text-red-800' :
                                  material.materialType === 'document' ? 'bg-blue-100 text-blue-800' :
                                  material.materialType === 'video' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {material.materialType}
                                </span>
                                
                                <button
                                  onClick={() => toggleMaterialVisibility(material)}
                                  className={`p-1 rounded ${
                                    material.isPublished 
                                      ? 'text-green-600 hover:bg-green-50' 
                                      : 'text-gray-400 hover:bg-gray-50'
                                  }`}
                                  title={material.isPublished ? 'Published (visible to students)' : 'Draft (not visible to students)'}
                                >
                                  {material.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            
                            {material.description && (
                              <p className="text-gray-600 mt-2">{material.description}</p>
                            )}
                            
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="mr-4">
                                Created: {new Date(material.createdAt).toLocaleDateString()}
                              </span>
                              
                              {material.dueDate && (
                                <>
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span className="text-red-600">
                                    Due: {new Date(material.dueDate).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center mt-2 space-x-4">
                              {material.filePath && (
                                <div className="flex items-center text-sm text-blue-600">
                                  <File className="h-4 w-4 mr-1" />
                                  <span>{material.fileName}</span>
                                </div>
                              )}
                              
                              {material.externalUrl && (
                                <a
                                  href={material.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <LinkIcon className="h-4 w-4 mr-1" />
                                  <span>External Link</span>
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteMaterial(material.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete material"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No materials uploaded yet.</p>
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Upload your first material
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Form */}
              {showUploadForm && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Upload Material</h3>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        {...register('title', { required: 'Title is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Material title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Type *
                      </label>
                      <select
                        {...register('materialType', { required: 'Material type is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="document">Document</option>
                        <option value="video">Video</option>
                        <option value="link">External Link</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>

                    {materialType === 'link' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          External URL *
                        </label>
                        <input
                          {...register('externalUrl', { 
                            required: materialType === 'link' ? 'URL is required' : false,
                            pattern: {
                              value: /^https?:\/\/.+/,
                              message: 'Please enter a valid URL'
                            }
                          })}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                        {errors.externalUrl && (
                          <p className="mt-1 text-sm text-red-600">{errors.externalUrl.message}</p>
                        )}
                      </div>
                    )}

                    {materialType !== 'link' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File Upload
                        </label>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Max file size: 5MB. Supported formats: PDF, DOC, PPT, XLS, images, videos, archives
                        </p>
                      </div>
                    )}

                    {materialType === 'assignment' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          {...register('dueDate')}
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        {...register('isPublished')}
                        type="checkbox"
                        id="isPublished"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                        Publish immediately (visible to students)
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Material
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {!isLoading && assignedSubjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No assigned classes yet.</p>
              <p className="text-sm mt-2">Contact administration to get class assignments.</p>
            </div>
          )}
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}