import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Camera, Save } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    religion: '',
    education: '',
    occupation: '',
    income: '',
    bio: '',
    city: '',
    state: '',
    country: 'India',
  });

  // Load existing profile on mount
  const { data: existingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/users/profile');
        return data;
      } catch {
        return null; // No profile yet
      }
    },
  });

  useEffect(() => {
    if (existingProfile) {
      setProfile({
        firstName: existingProfile.firstName || '',
        lastName: existingProfile.lastName || '',
        gender: existingProfile.gender || '',
        dateOfBirth: existingProfile.dateOfBirth || '',
        religion: existingProfile.religion || '',
        education: existingProfile.education || '',
        occupation: existingProfile.occupation || '',
        income: existingProfile.income || '',
        bio: existingProfile.bio || '',
        city: existingProfile.city || '',
        state: existingProfile.state || '',
        country: existingProfile.country || 'India',
      });
      setPhotoUrl(existingProfile.photos?.[0] || '');
      const hasRequiredFields =
        Boolean(existingProfile.firstName?.trim()) &&
        Boolean(existingProfile.gender?.trim()) &&
        Boolean(existingProfile.dateOfBirth?.trim()) &&
        Boolean(existingProfile.education?.trim()) &&
        Boolean(existingProfile.city?.trim()) &&
        Boolean(existingProfile.state?.trim());
      setIsEditing(!hasRequiredFields);
    } else {
      setIsEditing(true);
    }
  }, [existingProfile]);

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/users/profile/photo', formData);
      return data;
    },
    onMutate: () => {
      setIsUploadingPhoto(true);
    },
    onSuccess: (data) => {
      setPhotoUrl(data.photos?.[data.photos.length - 1] || '');
      toast.success('Profile photo uploaded!');
    },
    onError: () => {
      toast.error('Failed to upload profile photo');
    },
    onSettled: () => {
      setIsUploadingPhoto(false);
    },
  });

  const validateProfile = () => {
    const requiredFields = [
      { key: 'firstName', label: 'First name' },
      { key: 'gender', label: 'Gender' },
      { key: 'dateOfBirth', label: 'Date of birth' },
      { key: 'education', label: 'Education' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
    ] as const;

    const missing = requiredFields.filter((field) => {
      const value = profile[field.key];
      return !value || !value.toString().trim();
    });

    if (missing.length > 0) {
      toast.error(`Please fill ${missing.map((field) => field.label).join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    await saveProfile.mutateAsync();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
    uploadPhoto.mutate(file);
  };

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { firstName, lastName, dateOfBirth, religion, education, occupation, income, bio, city, state, country } = profile;
      const payload: any = {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        religion: religion || undefined,
        education: education || undefined,
        occupation: occupation || undefined,
        income: income || undefined,
        bio: bio || undefined,
        location: { city, state, country, pincode: '' },
      };
      // Only send gender if selected
      if (profile.gender) payload.gender = profile.gender;

      const { data } = await api.post('/users/profile', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['myProfile'], data);
      setIsEditing(false);
      toast.success('Profile saved!');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Save your details once, then edit them any time from this page.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-secondary"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="card">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-primary-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
              <p className="mt-1 text-gray-600">Your saved profile details are shown here for easy review.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-xs text-gray-500 uppercase">Name</p>
              <p className="mt-1 text-gray-900">{profile.firstName || '-'} {profile.lastName || ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Gender</p>
              <p className="mt-1 text-gray-900">{profile.gender || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Date of Birth</p>
              <p className="mt-1 text-gray-900">{profile.dateOfBirth || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Education</p>
              <p className="mt-1 text-gray-900">{profile.education || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">City</p>
              <p className="mt-1 text-gray-900">{profile.city || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">State</p>
              <p className="mt-1 text-gray-900">{profile.state || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 uppercase">About Me</p>
              <p className="mt-1 text-gray-900">{profile.bio || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="card">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-primary-500" />
              )}
            </div>
            <div>
              <button
                type="button"
                className="text-sm text-primary-600 font-medium flex items-center gap-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG. Max 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="input-field"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
              <input
                type="text"
                value={profile.religion}
                onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                className="input-field"
                placeholder="e.g. Hindu, Muslim, Christian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                className="input-field"
                placeholder="e.g. B.Tech, MBA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                className="input-field"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
              <input
                type="text"
                value={profile.income}
                onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                className="input-field"
                placeholder="e.g. 10-15 LPA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="input-field"
                placeholder="e.g. Mumbai"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="input-field"
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="input-field min-h-[100px] resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="btn-primary mt-6 flex items-center gap-2"
            disabled={saveProfile.isLoading}
          >
            <Save size={18} />
            {saveProfile.isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}
    </div>
  );
}
