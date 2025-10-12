'use client';

import { useEffect, useState } from 'react';

interface LearningMaterial {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  file_type: string;
  material_type: string;
  subject_code: string;
  subject_name: string;
  section_name: string;
  uploaded_by_name: string;
  upload_date: string;
  download_count: number;
  academic_year: string;
  semester: number;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<LearningMaterial[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  const materialTypes = ['handout', 'assignment', 'exam', 'reference', 'syllabus', 'project'];
  const subjects = [...new Set(materials.map(m => m.subject_code))].sort();

  useEffect(() => {
    fetchMaterials();
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedSubject, selectedType, searchTerm]);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedYear) params.append('academic_year', selectedYear);
      if (selectedSemester) params.append('semester', selectedSemester);

      const response = await fetch(`/api/student-services/materials?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (selectedSubject) {
      filtered = filtered.filter(m => m.subject_code === selectedSubject);
    }

    if (selectedType) {
      filtered = filtered.filter(m => m.material_type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleDownload = async (materialId: number, fileName: string) => {
    setDownloading(materialId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student-services/materials/${materialId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Refresh materials to update download count
        await fetchMaterials();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'ppt':
      case 'pptx':
        return (
          <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'handout': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-yellow-100 text-yellow-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'reference': return 'bg-green-100 text-green-800';
      case 'syllabus': return 'bg-purple-100 text-purple-800';
      case 'project': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Materials</h1>
          <p className="text-gray-600">Download class handouts, assignments, and reference materials</p>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">Summer</option>
          </select>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {materialTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedSubject('');
                setSelectedType('');
                setSearchTerm('');
              }}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getFileIcon(material.file_type)}
                    <div className="ml-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(material.material_type)}`}>
                        {material.material_type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {formatFileSize(material.file_size)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {material.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {material.description || 'No description available'}
                </p>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Subject:</span>
                    <span className="font-medium">{material.subject_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Section:</span>
                    <span>{material.section_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded by:</span>
                    <span>{material.uploaded_by_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(material.upload_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads:</span>
                    <span>{material.download_count}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(material.id, material.file_name)}
                  disabled={downloading === material.id}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {downloading === material.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {materials.length === 0 
              ? "No learning materials have been uploaded for this semester yet."
              : "No materials match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      )}

      {/* Download Guidelines */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Download Guidelines</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Materials are provided for educational purposes only</li>
          <li>• Do not redistribute or share materials outside the class</li>
          <li>• Contact your instructor if you have trouble accessing materials</li>
          <li>• Some materials may require specific software to view</li>
          <li>• Report any broken or corrupted files to your instructor</li>
        </ul>
      </div>
    </div>
  );
}
