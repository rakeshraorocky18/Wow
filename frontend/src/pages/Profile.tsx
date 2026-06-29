import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Camera,
  Save,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  Smile,
  Star,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  MapPin,
  FileText,
  Calendar,
  Lock,
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Custom Confetti Canvas Component
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
      });
    }

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y < height) {
          alive = true;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full animate-fade-in"
    />
  );
}

const PREDEFINED_HOBBIES = [
  'Reading', 'Traveling', 'Cooking', 'Photography', 'Movies', 'Music',
  'Dancing', 'Cricket', 'Football', 'Badminton', 'Chess', 'Swimming',
  'Painting', 'Writing', 'Gardening', 'Fitness', 'Yoga', 'Hiking',
  'Volunteering', 'Pets'
];

const PREDEFINED_INTERESTS = [
  'Technology', 'Business', 'Fashion', 'Nature', 'Food', 'Startups',
  'Adventure', 'Cars', 'Gaming', 'Art', 'Science'
];

const PREDEFINED_LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Punjabi', 'Telugu', 'Tamil',
  'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Spanish', 'French'
];

export default function Profile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customHobby, setCustomHobby] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  // Main Form Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    phoneNumber: '',
    emailAddress: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    address: '',
    languagesKnown: [] as string[],

    // Step 2: Family Background
    fatherName: '',
    fatherOccupation: '',
    fatherCompany: '',
    fatherEducation: '',
    motherName: '',
    motherOccupation: '',
    motherCompany: '',
    motherEducation: '',
    brothersCount: 0,
    sistersCount: 0,
    familyType: '',
    familyValues: '',
    familyStatus: '',
    religion: '',
    caste: '',
    subCaste: '',
    nativePlace: '',
    familyDescription: '',

    // Step 3: Professional Details
    currentlyWorking: 'No',
    companyName: '',
    jobTitle: '',
    employmentType: '',
    industry: '',
    experienceYears: 0,
    currentSalary: '',
    expectedSalary: '',
    workLocation: '',
    skills: [] as string[],
    linkedinProfile: '',
    portfolioWebsite: '',
    resumeUrl: '',
    noticePeriod: '',
    jobDescription: '',

    // Step 4: Education Details (list of records)
    educationDetails: [] as Array<{
      qualification: string;
      degree: string;
      specialization: string;
      institutionName: string;
      boardUniversity: string;
      startYear: string;
      endYear: string;
      percentageCgpa: string;
      certifications: string;
      achievements: string;
    }>,

    // Step 5: Hobbies & Interests
    hobbies: [] as string[],
    interests: [] as string[],

    // Step 6: Express Yourself
    lookingFor: '',
    lifeGoals: '',
    myStrengths: '',
    favoriteQuote: '',
    myMotto: '',
    futureDreams: '',
    whatMakesMeHappy: '',
    anythingElse: '',
  });

  // Fetch own profile
  const { data: existingProfile, isLoading: isFetchingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/users/profile');
        return data;
      } catch (err) {
        return null;
      }
    },
  });

  // Populate state on load
  useEffect(() => {
    if (existingProfile) {
      setProfile({
        firstName: existingProfile.firstName || '',
        lastName: existingProfile.lastName || '',
        displayName: existingProfile.displayName || '',
        dateOfBirth: existingProfile.dateOfBirth || '',
        gender: existingProfile.gender || '',
        maritalStatus: existingProfile.maritalStatus || '',
        phoneNumber: existingProfile.phoneNumber || '',
        emailAddress: existingProfile.emailAddress || existingProfile.email || '',
        country: existingProfile.country || 'India',
        state: existingProfile.state || '',
        city: existingProfile.city || '',
        pincode: existingProfile.pincode || '',
        address: existingProfile.address || '',
        languagesKnown: Array.isArray(existingProfile.languagesKnown)
          ? existingProfile.languagesKnown
          : existingProfile.languagesKnown
          ? (existingProfile.languagesKnown as string).split(',').map((s) => s.trim()).filter(Boolean)
          : [],

        fatherName: existingProfile.fatherName || '',
        fatherOccupation: existingProfile.fatherOccupation || '',
        fatherCompany: existingProfile.fatherCompany || '',
        fatherEducation: existingProfile.fatherEducation || '',
        motherName: existingProfile.motherName || '',
        motherOccupation: existingProfile.motherOccupation || '',
        motherCompany: existingProfile.motherCompany || '',
        motherEducation: existingProfile.motherEducation || '',
        brothersCount: Number(existingProfile.brothersCount) || 0,
        sistersCount: Number(existingProfile.sistersCount) || 0,
        familyType: existingProfile.familyType || '',
        familyValues: existingProfile.familyValues || '',
        familyStatus: existingProfile.familyStatus || '',
        religion: existingProfile.religion || '',
        caste: existingProfile.caste || '',
        subCaste: existingProfile.subCaste || '',
        nativePlace: existingProfile.nativePlace || '',
        familyDescription: existingProfile.familyDescription || '',

        currentlyWorking: existingProfile.currentlyWorking || 'No',
        companyName: existingProfile.companyName || '',
        jobTitle: existingProfile.jobTitle || existingProfile.occupation || '',
        employmentType: existingProfile.employmentType || '',
        industry: existingProfile.industry || '',
        experienceYears: Number(existingProfile.experienceYears) || 0,
        currentSalary: existingProfile.currentSalary || existingProfile.income || '',
        expectedSalary: existingProfile.expectedSalary || '',
        workLocation: existingProfile.workLocation || '',
        skills: Array.isArray(existingProfile.skills)
          ? existingProfile.skills
          : existingProfile.skills
          ? (existingProfile.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        linkedinProfile: existingProfile.linkedinProfile || '',
        portfolioWebsite: existingProfile.portfolioWebsite || '',
        resumeUrl: existingProfile.resumeUrl || '',
        noticePeriod: existingProfile.noticePeriod || '',
        jobDescription: existingProfile.jobDescription || '',

        educationDetails: Array.isArray(existingProfile.educationDetails)
          ? existingProfile.educationDetails
          : [],

        hobbies: Array.isArray(existingProfile.hobbies)
          ? existingProfile.hobbies
          : existingProfile.hobbies
          ? (existingProfile.hobbies as string).split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        interests: Array.isArray(existingProfile.interests)
          ? existingProfile.interests
          : existingProfile.interests
          ? (existingProfile.interests as string).split(',').map((s) => s.trim()).filter(Boolean)
          : [],

        lookingFor: existingProfile.lookingFor || '',
        lifeGoals: existingProfile.lifeGoals || '',
        myStrengths: existingProfile.myStrengths || '',
        favoriteQuote: existingProfile.favoriteQuote || '',
        myMotto: existingProfile.myMotto || '',
        futureDreams: existingProfile.futureDreams || '',
        whatMakesMeHappy: existingProfile.whatMakesMeHappy || '',
        anythingElse: existingProfile.anythingElse || '',
      });
      setPhotoUrl(existingProfile.photos?.[0] || '');

      const hasRequiredFields =
        Boolean(existingProfile.firstName?.trim()) &&
        Boolean(existingProfile.gender?.trim()) &&
        Boolean(existingProfile.dateOfBirth?.trim()) &&
        Boolean(existingProfile.city?.trim()) &&
        Boolean(existingProfile.state?.trim());
      setIsEditing(!hasRequiredFields);
    } else {
      setIsEditing(true);
    }
  }, [existingProfile]);

  // Mutations to save
  const buildProfilePayload = (payloadData: typeof profile) => {
    const {
      emailAddress,
      jobTitle,
      city,
      state,
      country,
      pincode,
      ...rest
    } = payloadData;

    const payload: Record<string, unknown> = {
      ...rest,
      email: emailAddress,
      bio: payloadData.lookingFor || payloadData.familyDescription || '',
      education: payloadData.educationDetails[0]?.degree || '',
      occupation: payloadData.currentlyWorking === 'Yes' ? jobTitle : 'Not Working',
      income: payloadData.currentlyWorking === 'Yes' ? payloadData.currentSalary : '0',
    };

    if (city?.trim()) payload.city = city.trim();
    if (state?.trim()) payload.state = state.trim();
    if (country?.trim()) payload.country = country.trim();
    if (pincode?.trim()) payload.pincode = pincode.trim();

    if (payload.city || payload.state || payload.country || payload.pincode) {
      payload.location = {
        city: payload.city || '',
        state: payload.state || '',
        country: payload.country || 'India',
        pincode: payload.pincode || '',
      };
    }

    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => {
        if (value === '' || value === null || value === undefined) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      }),
    );
  };

  const persistProfile = async (payloadData: typeof profile, showErrors = false) => {
    try {
      const payload = buildProfilePayload(payloadData);
      const { data } = await api.post('/users/profile', payload);
      queryClient.setQueryData(['myProfile'], data);
      queryClient.invalidateQueries({ queryKey: ['my-profile-for-match-filter'] });
      queryClient.invalidateQueries({ queryKey: ['matches-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      return data;
    } catch (err: any) {
      if (showErrors) {
        const message = err.response?.data?.message;
        if (Array.isArray(message)) {
          toast.error(message.join(', '));
        } else if (typeof message === 'string') {
          toast.error(message);
        } else {
          toast.error('Failed to save profile changes');
        }
      }
      throw err;
    }
  };

  const saveMutation = useMutation({
    mutationFn: (payloadData: typeof profile) => persistProfile(payloadData, false),
    onSuccess: (data) => {
      queryClient.setQueryData(['myProfile'], data);
    },
  });

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const data = await saveMutation.mutateAsync(profile);
      return data;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToSummary = async () => {
    try {
      await saveDraft();
      setIsEditing(false);
    } catch {
      toast.error('Failed to save before leaving the profile editor. Please try again.');
    }
  };

  const handleNextStep = async () => {
    try {
      await saveDraft();
      setCurrentStep((c) => Math.min(7, c + 1));
      window.scrollTo(0, 0);
    } catch {
      toast.error('Failed to save this step. Please try again.');
    }
  };

  const handlePrevStep = async () => {
    try {
      await saveDraft();
      setCurrentStep((c) => Math.max(1, c - 1));
      window.scrollTo(0, 0);
    } catch {
      toast.error('Failed to save this step. Please try again.');
    }
  };

  // File uploading mutations
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
      setPhotoUrl(data.photoUrl || data.photos?.[data.photos.length - 1] || '');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      toast.success('Profile photo uploaded!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload image. Use a valid image at least 100x100 pixels.');
    },
    onSettled: () => {
      setIsUploadingPhoto(false);
    },
  });

  // Handle drag & drop upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setPhotoUrl(URL.createObjectURL(file));
      uploadPhoto.mutate(file);
    }
  };

  // Remove profile photo
  const handleRemovePhoto = async () => {
    if (!photoUrl) return;
    try {
      const filename = photoUrl.split('/').pop();
      if (filename) {
        await api.delete(`/users/profile/photo/${filename}`);
        setPhotoUrl('');
        toast.success('Photo removed');
      }
    } catch {
      toast.error('Failed to remove photo');
    }
  };

  // Resume uploading handler
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingResume(true);
    try {
      const { data } = await api.post('/users/profile/resume', formData);
      setProfile((prev) => {
        const next = { ...prev, resumeUrl: data.resumeUrl };
        saveMutation.mutate(next);
        return next;
      });
      toast.success('Resume uploaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Remove resume file
  const handleRemoveResume = () => {
    setProfile((prev) => {
      const next = { ...prev, resumeUrl: '' };
      saveMutation.mutate(next);
      return next;
    });
    toast.success('Resume removed');
  };

  // Completion calculation
  const calculateCompletionPercentage = () => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.displayName,
      profile.dateOfBirth,
      profile.gender,
      profile.maritalStatus,
      profile.phoneNumber,
      profile.emailAddress,
      profile.city,
      profile.state,
      profile.country,
      profile.pincode,
      profile.address,
      profile.languagesKnown.length > 0 ? 'yes' : '',
      profile.fatherName,
      profile.motherName,
      profile.familyType,
      profile.familyValues,
      profile.religion,
      profile.currentlyWorking,
      profile.currentlyWorking === 'Yes' ? profile.jobTitle : 'ok',
      profile.currentlyWorking === 'Yes' ? profile.companyName : 'ok',
      profile.educationDetails.length > 0 ? 'yes' : '',
      profile.hobbies.length > 0 ? 'yes' : '',
      profile.interests.length > 0 ? 'yes' : '',
      profile.lookingFor,
      profile.lifeGoals,
    ];
    const filled = fields.filter((f) => f && f.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  // Step field validations (only used on final submit)
  const validateAllSteps = () => {
    if (!profile.firstName.trim()) { toast.error('First Name is required'); return false; }
    if (!profile.lastName.trim()) { toast.error('Last Name is required'); return false; }
    if (!profile.displayName.trim()) { toast.error('Display Name is required'); return false; }
    if (!profile.dateOfBirth) { toast.error('Date of Birth is required'); return false; }
    if (!profile.gender) { toast.error('Gender is required'); return false; }
    if (!profile.phoneNumber.trim()) { toast.error('Phone Number is required'); return false; }
    if (!profile.emailAddress.trim()) { toast.error('Email Address is required'); return false; }
    if (!profile.city.trim()) { toast.error('City is required'); return false; }
    if (!profile.state.trim()) { toast.error('State is required'); return false; }
    if (profile.currentlyWorking === 'Yes') {
      if (!profile.companyName.trim()) { toast.error('Company Name is required'); return false; }
      if (!profile.jobTitle.trim()) { toast.error('Job Title is required'); return false; }
    }
    return true;
  };

  const handleFinalSubmit = async () => {
    if (!validateAllSteps()) return;
    try {
      await persistProfile(profile, true);
      setShowSuccess(true);
      window.scrollTo(0, 0);
    } catch {
      toast.error('Failed to submit profile. Please try again.');
    }
  };

  // Add items dynamic handlers
  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      educationDetails: [
        ...prev.educationDetails,
        {
          qualification: '',
          degree: '',
          specialization: '',
          institutionName: '',
          boardUniversity: '',
          startYear: '',
          endYear: '',
          percentageCgpa: '',
          certifications: '',
          achievements: '',
        },
      ],
    }));
  };

  const updateEducation = (index: number, key: string, value: string) => {
    setProfile((prev) => {
      const copy = [...prev.educationDetails];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, educationDetails: copy };
    });
  };

  const removeEducation = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      educationDetails: prev.educationDetails.filter((_, i) => i !== index),
    }));
  };

  const toggleLanguage = (lang: string) => {
    setProfile((prev) => {
      const exists = prev.languagesKnown.includes(lang);
      const list = exists
        ? prev.languagesKnown.filter((l) => l !== lang)
        : [...prev.languagesKnown, lang];
      return { ...prev, languagesKnown: list };
    });
  };

  const addCustomLanguage = () => {
    if (!customLanguage.trim()) return;
    if (profile.languagesKnown.includes(customLanguage.trim())) {
      setCustomLanguage('');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      languagesKnown: [...prev.languagesKnown, customLanguage.trim()],
    }));
    setCustomLanguage('');
  };

  const toggleHobby = (hobby: string) => {
    setProfile((prev) => {
      const exists = prev.hobbies.includes(hobby);
      const list = exists
        ? prev.hobbies.filter((h) => h !== hobby)
        : [...prev.hobbies, hobby];
      return { ...prev, hobbies: list };
    });
  };

  const addCustomHobby = () => {
    if (!customHobby.trim()) return;
    if (profile.hobbies.includes(customHobby.trim())) {
      setCustomHobby('');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      hobbies: [...prev.hobbies, customHobby.trim()],
    }));
    setCustomHobby('');
  };

  const toggleInterest = (interest: string) => {
    setProfile((prev) => {
      const exists = prev.interests.includes(interest);
      const list = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: list };
    });
  };

  const addSkill = () => {
    if (!customSkill.trim()) return;
    if (profile.skills.includes(customSkill.trim())) {
      setCustomSkill('');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, customSkill.trim()],
    }));
    setCustomSkill('');
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  if (isFetchingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  // --- Success View ---
  if (showSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-12 px-4 relative">
        <ConfettiCanvas active={showSuccess} />
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-100 animate-bounce">
          <Check size={48} className="stroke-[3]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-gray-900">Successfully Updated!</h1>
          <p className="text-gray-600">🎉 Your profile has been updated successfully.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm max-w-sm mx-auto">
          <div className="text-left space-y-3 text-sm text-gray-600">
            <p className="flex justify-between"><strong>Display Name:</strong> <span>{profile.displayName}</span></p>
            <p className="flex justify-between"><strong>Gender:</strong> <span className="capitalize">{profile.gender}</span></p>
            <p className="flex justify-between"><strong>Profile Status:</strong> <span className="text-green-600 font-medium">100% Completed</span></p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowSuccess(false);
            setIsEditing(false);
            setCurrentStep(1);
          }}
          className="btn-primary w-full max-w-xs shadow-lg shadow-primary-500/20"
        >
          View Profile Card
        </button>
      </div>
    );
  }

  // --- Read Only Profile Details Summary View ---
  if (!isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-primary-600 via-pink-600 to-indigo-600 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-white/60" />
              )}
            </div>
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl font-display font-bold">{profile.firstName} {profile.lastName}</h1>
                {profile.displayName && (
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium tracking-wide">
                    @{profile.displayName}
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm max-w-xl line-clamp-2">
                {profile.lookingFor || profile.familyDescription || 'No description provided yet.'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
                <span className="flex items-center gap-1"><MapPin size={13} /> {profile.city}, {profile.state}</span>
                <span className="flex items-center gap-1"><Calendar size={13} /> DOB: {profile.dateOfBirth}</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-semibold text-sm transition-all shadow-md hover:scale-105 duration-200"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Categories Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main info card */}
          <div className="md:col-span-2 space-y-6">
            <div className="card space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <User size={18} className="text-primary-500" /> Personal details
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gender</p>
                  <p className="mt-1 text-gray-800 font-medium capitalize">{profile.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Marital Status</p>
                  <p className="mt-1 text-gray-800 font-medium capitalize">{profile.maritalStatus || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.phoneNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.emailAddress || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Location</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.address ? `${profile.address}, ` : ''}{profile.city}, {profile.state}, {profile.country} - {profile.pincode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Languages Known</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.languagesKnown.length > 0 ? (
                      profile.languagesKnown.map((lang) => (
                        <span key={lang} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{lang}</span>
                      ))
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Family Details Card */}
            <div className="card space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Heart size={18} className="text-pink-500" /> Family Background
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Father's Name</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.fatherName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Father's Profession</p>
                  <p className="mt-1 text-gray-800 font-medium">
                    {profile.fatherOccupation || '-'}{profile.fatherCompany ? ` at ${profile.fatherCompany}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Mother's Name</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.motherName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Mother's Profession</p>
                  <p className="mt-1 text-gray-800 font-medium">
                    {profile.motherOccupation || '-'}{profile.motherCompany ? ` at ${profile.motherCompany}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Siblings</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.brothersCount} Brothers, {profile.sistersCount} Sisters</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Family Setup</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.familyType || '-'} / {profile.familyValues || '-'} / {profile.familyStatus || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Native Place & Details</p>
                  <p className="mt-1 text-gray-800 font-medium">{profile.nativePlace || '-'}{profile.religion ? ` (${profile.religion}${profile.caste ? `, ${profile.caste}` : ''})` : ''}</p>
                </div>
                {profile.familyDescription && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Family Description</p>
                    <p className="mt-1 text-gray-700 italic">"{profile.familyDescription}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Card */}
            <div className="card space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-500" /> Professional Experience
              </h2>
              {profile.currentlyWorking === 'No' ? (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-500">Currently Not Working</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Designation</p>
                    <p className="mt-1 text-gray-800 font-bold">{profile.jobTitle || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Company</p>
                    <p className="mt-1 text-gray-800 font-medium">{profile.companyName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Industry & Type</p>
                    <p className="mt-1 text-gray-800 font-medium">{profile.industry || '-'} ({profile.employmentType || '-'})</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Experience & Salary</p>
                    <p className="mt-1 text-gray-800 font-medium">{profile.experienceYears} Years ({profile.currentSalary || '-'})</p>
                  </div>
                  {profile.linkedinProfile && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">LinkedIn</p>
                      <a href={profile.linkedinProfile} target="_blank" rel="noreferrer" className="mt-1 text-primary-600 hover:underline block text-xs truncate">{profile.linkedinProfile}</a>
                    </div>
                  )}
                  {profile.resumeUrl && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Attached Resume</p>
                      <a href={`${api.defaults.baseURL || ''}${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="mt-1 text-indigo-600 hover:underline flex items-center gap-1 text-xs">
                        <FileText size={12} /> View Resume
                      </a>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Key Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">{skill}</span>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Education Card */}
            <div className="card space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <GraduationCap size={18} className="text-emerald-500" /> Education Details
              </h2>
              {profile.educationDetails.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No education records added.</p>
              ) : (
                <div className="space-y-4">
                  {profile.educationDetails.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-emerald-400 pl-4 py-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-gray-800">{edu.degree} in {edu.specialization}</h4>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">{edu.startYear} - {edu.endYear}</span>
                      </div>
                      <p className="text-xs text-gray-500">{edu.institutionName} ({edu.boardUniversity})</p>
                      <p className="text-xs text-gray-600"><strong>Performance:</strong> {edu.percentageCgpa}</p>
                      {(edu.certifications || edu.achievements) && (
                        <p className="text-xs text-gray-600 italic">"{edu.certifications || edu.achievements}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expressive Bio */}
            <div className="card space-y-4 bg-gradient-to-br from-pink-50/50 to-indigo-50/30 border-pink-100/50">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Smile size={16} className="text-primary-500" /> About Me & Hopes
              </h3>
              {profile.favoriteQuote && (
                <div className="border-l-2 border-pink-400 pl-3 py-1">
                  <p className="text-xs text-gray-400 italic font-semibold">Favorite Quote</p>
                  <p className="text-sm font-semibold text-gray-700 italic mt-0.5">"{profile.favoriteQuote}"</p>
                </div>
              )}
              {profile.myMotto && (
                <div className="border-l-2 border-indigo-400 pl-3 py-1">
                  <p className="text-xs text-gray-400 italic font-semibold">Life Motto</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">"{profile.myMotto}"</p>
                </div>
              )}
              {profile.lifeGoals && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Life Goals</p>
                  <p className="text-xs text-gray-600">{profile.lifeGoals}</p>
                </div>
              )}
              {profile.myStrengths && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">My Strengths</p>
                  <p className="text-xs text-gray-600">{profile.myStrengths}</p>
                </div>
              )}
              {profile.futureDreams && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Future Dreams</p>
                  <p className="text-xs text-gray-600">{profile.futureDreams}</p>
                </div>
              )}
            </div>

            {/* Hobbies Card */}
            <div className="card space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Star size={16} className="text-yellow-500" /> Hobbies & Interests
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1.5">Hobbies</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.hobbies.length > 0 ? (
                      profile.hobbies.map((h) => (
                        <span key={h} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md border border-pink-100">{h}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1.5">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.length > 0 ? (
                      profile.interests.map((i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">{i}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Wizard Edit Profile view ---
  const completion = calculateCompletionPercentage();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Sticky Top Header with Completion and Stepper */}
      <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-md p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary-500" /> Complete Your Profile
            </h1>
            <p className="text-xs text-gray-500">Step {currentStep} of 7: {currentStep === 7 ? 'Review & Submit' : `Section ${currentStep}`}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-primary-600">{completion}% Complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 via-pink-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${completion}%` }}
          ></div>
        </div>

        {/* Stepper Dots */}
        <div className="flex justify-between md:px-4 text-xs font-semibold text-gray-400 pt-1 overflow-x-auto gap-2">
          {[
            { n: 1, l: 'Personal' },
            { n: 2, l: 'Family' },
            { n: 3, l: 'Career' },
            { n: 4, l: 'Education' },
            { n: 5, l: 'Hobbies' },
            { n: 6, l: 'About Me' },
            { n: 7, l: 'Submit' },
          ].map((s) => {
            const isCompleted = currentStep > s.n;
            const isActive = currentStep === s.n;
            return (
              <button
                key={s.n}
                disabled={currentStep === 7 && s.n < 7} // Allow navigation unless final review submit is active or keep enabled
                onClick={() => {
                  saveDraft();
                  setCurrentStep(s.n);
                }}
                className={`flex items-center gap-1 whitespace-nowrap pb-1 border-b-2 transition-all ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : isCompleted
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-primary-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{s.n}</span>
                <span className="hidden sm:inline">{s.l}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main glassmorphic editor card */}
      <div className="card bg-white/90 shadow-xl border border-gray-100 p-6 md:p-8 animate-slide-in">

        {/* --- STEP 1: Personal Details & Circular Photo --- */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User size={20} className="text-primary-500" /> Step 1 – Personal Details & Profile Photo
            </h2>

            {/* Profile Photo drag-and-drop crop preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-100 relative bg-gray-50 flex items-center justify-center shadow-md group cursor-pointer"
                title="Drag & Drop Profile Image Here"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${cropZoom})` }}
                  />
                ) : (
                  <div className="text-center text-gray-400 p-3">
                    <User size={36} className="mx-auto mb-1 text-primary-300" />
                    <span className="text-[10px] font-semibold block">DRAG HERE</span>
                  </div>
                )}
                {/* Overlay camera icon */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-primary-700 flex items-center gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={13} /> {isUploadingPhoto ? 'Uploading...' : 'Upload Image'}
                  </button>
                  {photoUrl && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100"
                      onClick={handleRemovePhoto}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                      <p className="text-[11px] text-gray-400">Supported formats: JPG, PNG. Max size: 5MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPhotoUrl(URL.createObjectURL(f));
                      uploadPhoto.mutate(f);
                    }
                  }}
                  className="hidden"
                />

                {/* Simulated CSS Crop Zoom slider */}
                {photoUrl && (
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 inline-block w-full max-w-xs">
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Adjust Portrait Zoom (Visual Crop)</label>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.1"
                      value={cropZoom}
                      onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Grid Form Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. John"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Display Name / Alias <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. johndoe12"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gender <span className="text-red-500">*</span></label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Marital Status</label>
                <select
                  value={profile.maritalStatus}
                  onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">Select Status</option>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="awaiting_divorce">Awaiting Divorce</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={profile.emailAddress}
                  onChange={(e) => setProfile({ ...profile, emailAddress: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State / Region <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pincode / Zip</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. 400001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Address details</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="input-field text-sm min-h-[70px] resize-none"
                  placeholder="Flat No, Street Name, Locality..."
                />
              </div>

              {/* Languages Known selector */}
              <div className="md:col-span-2 space-y-2.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Languages Known</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {PREDEFINED_LANGUAGES.map((lang) => {
                    const isSelected = profile.languagesKnown.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-primary-50 text-primary-700 border-primary-200 font-semibold'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
                {/* Custom Language Addition */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLanguage())}
                    className="input-field text-sm py-2 px-3"
                    placeholder="Other language..."
                  />
                  <button
                    type="button"
                    onClick={addCustomLanguage}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg text-sm flex items-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: Family Background --- */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Heart size={20} className="text-pink-500" /> Step 2 – Family Background
            </h2>

            {/* Father Details */}
            <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Father details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={profile.fatherName}
                    onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="Father's full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Father's Occupation</label>
                  <input
                    type="text"
                    value={profile.fatherOccupation}
                    onChange={(e) => setProfile({ ...profile, fatherOccupation: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="e.g. Retired Government Officer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={profile.fatherCompany}
                    onChange={(e) => setProfile({ ...profile, fatherCompany: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="e.g. Indian Railways"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Education level</label>
                  <input
                    type="text"
                    value={profile.fatherEducation}
                    onChange={(e) => setProfile({ ...profile, fatherEducation: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="e.g. Post Graduate"
                  />
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Mother details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={profile.motherName}
                    onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="Mother's full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Mother's Occupation</label>
                  <input
                    type="text"
                    value={profile.motherOccupation}
                    onChange={(e) => setProfile({ ...profile, motherOccupation: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="e.g. Homemaker, Teacher"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={profile.motherCompany}
                    onChange={(e) => setProfile({ ...profile, motherCompany: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="e.g. Public School"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Education level</label>
                  <input
                    type="text"
                    value={profile.motherEducation}
                    onChange={(e) => setProfile({ ...profile, motherEducation: e.target.value })}
                    className="input-field text-sm bg-white"
                    placeholder="e.g. B.Sc Graduate"
                  />
                </div>
              </div>
            </div>

            {/* Siblings Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Number of Brothers</label>
                <input
                  type="number"
                  min="0"
                  value={profile.brothersCount}
                  onChange={(e) => setProfile({ ...profile, brothersCount: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Number of Sisters</label>
                <input
                  type="number"
                  min="0"
                  value={profile.sistersCount}
                  onChange={(e) => setProfile({ ...profile, sistersCount: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* General Family Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Family Type</label>
                <select
                  value={profile.familyType}
                  onChange={(e) => setProfile({ ...profile, familyType: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="Nuclear">Nuclear Family</option>
                  <option value="Joint">Joint Family</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Family Values</label>
                <select
                  value={profile.familyValues}
                  onChange={(e) => setProfile({ ...profile, familyValues: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">Select Values</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Liberal">Liberal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Family Status</label>
                <select
                  value={profile.familyStatus}
                  onChange={(e) => setProfile({ ...profile, familyStatus: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">Select Status</option>
                  <option value="Middle Class">Middle Class</option>
                  <option value="Upper Middle Class">Upper Middle Class</option>
                  <option value="Affluent">Affluent</option>
                  <option value="Rich">Rich</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Religion</label>
                <select
                  value={profile.religion}
                  onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">Select Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Parsi">Parsi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Caste</label>
                <input
                  type="text"
                  value={profile.caste}
                  onChange={(e) => setProfile({ ...profile, caste: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Caste name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Sub Caste</label>
                <input
                  type="text"
                  value={profile.subCaste}
                  onChange={(e) => setProfile({ ...profile, subCaste: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Sub Caste if any"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Native Place / Hometown</label>
                <input
                  type="text"
                  value={profile.nativePlace}
                  onChange={(e) => setProfile({ ...profile, nativePlace: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. Pune, Maharashtra"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Family Description</label>
                <textarea
                  value={profile.familyDescription}
                  onChange={(e) => setProfile({ ...profile, familyDescription: e.target.value })}
                  className="input-field text-sm min-h-[80px]"
                  placeholder="Write a short note on your family values, background, and expectations..."
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: Professional Details --- */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-500" /> Step 3 – Professional / Working Experience
            </h2>

            {/* Currently Working Toggle */}
            <div className="space-y-2 bg-gray-50 p-4 border border-gray-150 rounded-2xl">
              <label className="block text-sm font-bold text-gray-700">Currently Working?</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, currentlyWorking: 'Yes' })}
                  className={`flex-1 py-3 px-6 rounded-xl border text-sm font-bold transition-all ${
                    profile.currentlyWorking === 'Yes'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Yes, I am Employed
                </button>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, currentlyWorking: 'No' })}
                  className={`flex-1 py-3 px-6 rounded-xl border text-sm font-bold transition-all ${
                    profile.currentlyWorking === 'No'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  No, Not Working
                </button>
              </div>
            </div>

            {/* Conditional working fields */}
            {profile.currentlyWorking === 'No' ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
                <Briefcase size={36} className="text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-600">Currently Not Working</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">No employment details required. You can proceed directly to Education Details.</p>
              </div>
            ) : (
              <div className="space-y-5 animate-slide-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. Google India"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Title / Designation <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. Technical Program Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Employment Type</label>
                    <select
                      value={profile.employmentType}
                      onChange={(e) => setProfile({ ...profile, employmentType: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time Employee</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract Worker</option>
                      <option value="Self-employed">Self-employed / Freelancer</option>
                      <option value="Business Owner">Business Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Industry</label>
                    <select
                      value={profile.industry}
                      onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="">Select Industry</option>
                      <option value="IT / Software">IT / Software Development</option>
                      <option value="Finance / Banking">Finance / Investment Banking</option>
                      <option value="Healthcare / Medical">Healthcare / Medicine</option>
                      <option value="Education / Academia">Education / Teaching</option>
                      <option value="Core Engineering">Engineering / Manufacturing</option>
                      <option value="Government">Government Service</option>
                      <option value="Marketing / Sales">Marketing & Sales</option>
                      <option value="Art / Creative">Art & Design</option>
                      <option value="Other">Other Sector</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={profile.experienceYears}
                      onChange={(e) => setProfile({ ...profile, experienceYears: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Current Annual Salary</label>
                    <input
                      type="text"
                      value={profile.currentSalary}
                      onChange={(e) => setProfile({ ...profile, currentSalary: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. 15-18 LPA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Expected Salary</label>
                    <input
                      type="text"
                      value={profile.expectedSalary}
                      onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. 20-25 LPA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Work Location / City</label>
                    <input
                      type="text"
                      value={profile.workLocation}
                      onChange={(e) => setProfile({ ...profile, workLocation: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. Bengaluru, India"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">LinkedIn Profile Link</label>
                    <input
                      type="url"
                      value={profile.linkedinProfile}
                      onChange={(e) => setProfile({ ...profile, linkedinProfile: e.target.value })}
                      className="input-field text-sm"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Portfolio Website</label>
                    <input
                      type="url"
                      value={profile.portfolioWebsite}
                      onChange={(e) => setProfile({ ...profile, portfolioWebsite: e.target.value })}
                      className="input-field text-sm"
                      placeholder="https://myportfolio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notice Period</label>
                    <select
                      value={profile.noticePeriod}
                      onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="">Select Notice Period</option>
                      <option value="Immediate">Immediate / Serving Notice</option>
                      <option value="15 days">15 Days</option>
                      <option value="30 days">30 Days</option>
                      <option value="60 days">60 Days</option>
                      <option value="90 days">90 Days</option>
                    </select>
                  </div>
                </div>

                {/* Skills tags list input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Skills & Expertises</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    {profile.skills.length === 0 ? (
                      <span className="text-xs text-gray-400 p-1">No skills added yet. Type below to add.</span>
                    ) : (
                      profile.skills.map((skill) => (
                        <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 pl-3 pr-1 py-1 rounded-full border border-indigo-200 flex items-center gap-1 font-semibold">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="w-4 h-4 rounded-full bg-indigo-200/50 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors text-[10px]"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="input-field text-sm py-2 px-3"
                      placeholder="Add a skill (e.g. Product Design, Python)..."
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Resume Upload Component */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Resume Upload</label>
                  {profile.resumeUrl ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <FileText size={28} className="text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-800">Resume Attached</p>
                        <a href={`${api.defaults.baseURL || ''}${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">
                          View Uploaded Document
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="p-2 text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg shadow-sm"
                        title="Delete Resume"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => resumeInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-gray-50 rounded-xl p-6 text-center cursor-pointer transition-all space-y-1.5"
                    >
                      <Upload size={24} className="text-gray-400 mx-auto" />
                      <p className="text-xs font-bold text-gray-700">{isUploadingResume ? 'Uploading resume...' : 'Drag or click to upload your Resume'}</p>
                      <p className="text-[10px] text-gray-400">PDF, DOC, DOCX. Max file size: 10MB</p>
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Description / Responsibilities</label>
                  <textarea
                    value={profile.jobDescription}
                    onChange={(e) => setProfile({ ...profile, jobDescription: e.target.value })}
                    className="input-field text-sm min-h-[90px]"
                    placeholder="Briefly describe your day-to-day role and achievements at work..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 4: Education Details --- */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap size={20} className="text-emerald-500" /> Step 4 – Education Details
              </h2>
              <button
                type="button"
                onClick={addEducation}
                className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus size={14} /> Add Another Education
              </button>
            </div>

            {profile.educationDetails.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-3">
                <GraduationCap size={44} className="text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No Education Records</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">Adding educational history helps match you with compatible partners who value similar qualifications.</p>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold shadow-md inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Add First Record
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.educationDetails.map((edu, idx) => (
                  <div key={idx} className="bg-gray-50/50 p-4 md:p-6 border border-gray-200/80 rounded-2xl relative space-y-4 animate-slide-in">
                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Education Record #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-200 transition-all"
                        title="Remove Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Qualification</label>
                        <select
                          value={edu.qualification}
                          onChange={(e) => updateEducation(idx, 'qualification', e.target.value)}
                          className="input-field text-sm bg-white"
                        >
                          <option value="">Select Level</option>
                          <option value="Doctorate">Doctorate / Ph.D</option>
                          <option value="Post Graduation">Post Graduation / Master</option>
                          <option value="Graduation">Graduation / Bachelor</option>
                          <option value="Undergrad">Undergrad Diploma</option>
                          <option value="High School">High School (12th)</option>
                          <option value="Diploma">Other Technical Diploma</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Degree Title</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. B.Tech, MBA, M.A."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Specialization / Major</label>
                        <input
                          type="text"
                          value={edu.specialization}
                          onChange={(e) => updateEducation(idx, 'specialization', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. Computer Science, Finance"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Institution Name</label>
                        <input
                          type="text"
                          value={edu.institutionName}
                          onChange={(e) => updateEducation(idx, 'institutionName', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="School or College name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Board / University</label>
                        <input
                          type="text"
                          value={edu.boardUniversity}
                          onChange={(e) => updateEducation(idx, 'boardUniversity', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. CBSE, Mumbai University"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startYear}
                          onChange={(e) => updateEducation(idx, 'startYear', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. 2018"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">End Year / Expected</label>
                        <input
                          type="text"
                          value={edu.endYear}
                          onChange={(e) => updateEducation(idx, 'endYear', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. 2022"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Percentage / CGPA</label>
                        <input
                          type="text"
                          value={edu.percentageCgpa}
                          onChange={(e) => updateEducation(idx, 'percentageCgpa', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. 85% or 8.9 CGPA"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Certifications & Short Courses</label>
                        <input
                          type="text"
                          value={edu.certifications}
                          onChange={(e) => updateEducation(idx, 'certifications', e.target.value)}
                          className="input-field text-sm bg-white"
                          placeholder="e.g. AWS Solutions Architect, Digital Marketing Cert"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Key Achievements & Projects</label>
                        <textarea
                          value={edu.achievements}
                          onChange={(e) => updateEducation(idx, 'achievements', e.target.value)}
                          className="input-field text-sm min-h-[60px] bg-white"
                          placeholder="e.g. Published a research paper, Gold medalist in university..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- STEP 5: Hobbies & Interests --- */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" /> Step 5 – Hobbies & Interests
            </h2>

            {/* Hobbies list chips */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Hobbies</label>
              <p className="text-xs text-gray-400">Select hobbies that define your leisure time activities:</p>
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {PREDEFINED_HOBBIES.map((h) => {
                  const isSelected = profile.hobbies.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHobby(h)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-pink-100 text-pink-800 border-pink-200 font-semibold scale-105 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
              {/* Custom hobby addition */}
              <div className="flex gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={customHobby}
                  onChange={(e) => setCustomHobby(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHobby())}
                  className="input-field text-sm py-2 px-3"
                  placeholder="Other hobby (e.g. Sailing)..."
                />
                <button
                  type="button"
                  onClick={addCustomHobby}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-semibold flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Interests list chips */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Interests</label>
              <p className="text-xs text-gray-400">Select topics you find highly intriguing and like to study/talk about:</p>
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {PREDEFINED_INTERESTS.map((i) => {
                  const isSelected = profile.interests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold scale-105 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 6: Express Yourself --- */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Smile size={20} className="text-primary-500" /> Step 6 – Express Yourself (About Me)
            </h2>
            <p className="text-xs text-gray-500 font-semibold italic text-pink-500">"Tell everyone about yourself ❤️"</p>

            <div className="space-y-5">
              {/* Bio About Me */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">About Me <span className="text-red-500">*</span></label>
                <textarea
                  value={profile.lookingFor}
                  onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
                  className="input-field text-sm min-h-[100px] resize-none"
                  placeholder="Write something about yourself, your personality, dreams, passions, and what makes you unique..."
                />
                <span className="text-[10px] text-gray-400 font-medium block text-right">
                  {profile.lookingFor.length} characters
                </span>
              </div>

              {/* Looking For */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Looking For (Partner Expectations)</label>
                <textarea
                  value={profile.lifeGoals}
                  onChange={(e) => setProfile({ ...profile, lifeGoals: e.target.value })}
                  className="input-field text-sm min-h-[90px] resize-none"
                  placeholder="What kind of life partner, friend, or companion are you looking for?"
                />
                <span className="text-[10px] text-gray-400 font-medium block text-right">
                  {profile.lifeGoals.length} characters
                </span>
              </div>

              {/* Life Goals */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">My Strengths</label>
                <textarea
                  value={profile.myStrengths}
                  onChange={(e) => setProfile({ ...profile, myStrengths: e.target.value })}
                  className="input-field text-sm min-h-[70px] resize-none"
                  placeholder="e.g. Adaptable, empathetic, excellent communicator, resilient..."
                />
              </div>

              {/* Quotes & Mottos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Favorite Quote</label>
                  <input
                    type="text"
                    value={profile.favoriteQuote}
                    onChange={(e) => setProfile({ ...profile, favoriteQuote: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. To live is the rarest thing in the world."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">My Motto in Life</label>
                  <input
                    type="text"
                    value={profile.myMotto}
                    onChange={(e) => setProfile({ ...profile, myMotto: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. Work hard, stay humble."
                  />
                </div>
              </div>

              {/* Future Dreams */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Future Dreams & Ambitions</label>
                <textarea
                  value={profile.futureDreams}
                  onChange={(e) => setProfile({ ...profile, futureDreams: e.target.value })}
                  className="input-field text-sm min-h-[70px] resize-none"
                  placeholder="Where do you see yourself in 5 years? Describe your aspirations..."
                />
              </div>

              {/* Happiness */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">What Makes Me Happy?</label>
                <textarea
                  value={profile.whatMakesMeHappy}
                  onChange={(e) => setProfile({ ...profile, whatMakesMeHappy: e.target.value })}
                  className="input-field text-sm min-h-[70px] resize-none"
                  placeholder="e.g. A long hike, cooking for friends, playing guitar on weekends..."
                />
              </div>

              {/* Anything Else */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Anything Else You Want to Share?</label>
                <textarea
                  value={profile.anythingElse}
                  onChange={(e) => setProfile({ ...profile, anythingElse: e.target.value })}
                  className="input-field text-sm min-h-[90px] resize-none"
                  placeholder="Any other details, lifestyle choices, travel logs, habits, or hobbies you'd like to share..."
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 7: Final Review Page --- */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Sparkles size={20} className="text-primary-500 animate-pulse" /> Final Profile Review
            </h2>
            <p className="text-xs text-gray-500">Please review all your entered information. You can jump directly to edit any section if required.</p>

            {/* Glassmorphic categories breakdown */}
            <div className="space-y-5">
              {/* Category 1: Personal Details */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><User size={15} className="text-primary-500" /> Personal details</h3>
                  <button onClick={() => setCurrentStep(1)} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-bold"><Save size={12} /> Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{profile.firstName} {profile.lastName}</p>
                      <p className="text-gray-400 text-[11px]">Display Name: @{profile.displayName}</p>
                    </div>
                  </div>
                  <div><p className="text-gray-400">Gender / DOB:</p><p className="font-semibold text-gray-700 capitalize">{profile.gender} / {profile.dateOfBirth}</p></div>
                  <div><p className="text-gray-400">Marital Status:</p><p className="font-semibold text-gray-700 capitalize">{profile.maritalStatus || '-'}</p></div>
                  <div><p className="text-gray-400">Phone / Email:</p><p className="font-semibold text-gray-700">{profile.phoneNumber} / {profile.emailAddress}</p></div>
                  <div><p className="text-gray-400">Location:</p><p className="font-semibold text-gray-700">{profile.city}, {profile.state}, {profile.country}</p></div>
                  <div className="col-span-2"><p className="text-gray-400">Languages Known:</p><p className="font-semibold text-gray-700">{profile.languagesKnown.join(', ') || '-'}</p></div>
                </div>
              </div>

              {/* Category 2: Family Background */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Heart size={15} className="text-pink-500" /> Family Background</h3>
                  <button onClick={() => setCurrentStep(2)} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-bold"><Save size={12} /> Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><p className="text-gray-400">Father's Name & Role:</p><p className="font-semibold text-gray-700">{profile.fatherName || '-'} ({profile.fatherOccupation || '-'})</p></div>
                  <div><p className="text-gray-400">Mother's Name & Role:</p><p className="font-semibold text-gray-700">{profile.motherName || '-'} ({profile.motherOccupation || '-'})</p></div>
                  <div><p className="text-gray-400">Brothers / Sisters:</p><p className="font-semibold text-gray-700">{profile.brothersCount} / {profile.sistersCount}</p></div>
                  <div><p className="text-gray-400">Setup & Values:</p><p className="font-semibold text-gray-700">{profile.familyType || '-'} / {profile.familyValues || '-'}</p></div>
                  <div className="col-span-2"><p className="text-gray-400">Religion / Caste / Hometown:</p><p className="font-semibold text-gray-700">{profile.religion || '-'} / {profile.caste || '-'} ({profile.nativePlace || '-'})</p></div>
                </div>
              </div>

              {/* Category 3: Professional Details */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Briefcase size={15} className="text-indigo-500" /> Professional Details</h3>
                  <button onClick={() => setCurrentStep(3)} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-bold"><Save size={12} /> Edit</button>
                </div>
                {profile.currentlyWorking === 'No' ? (
                  <p className="text-xs text-gray-500 italic">Currently Not Working</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><p className="text-gray-400">Company & Job Title:</p><p className="font-bold text-gray-700">{profile.companyName} - {profile.jobTitle}</p></div>
                    <div><p className="text-gray-400">Industry & Type:</p><p className="font-semibold text-gray-700">{profile.industry || '-'} ({profile.employmentType || '-'})</p></div>
                    <div><p className="text-gray-400">Experience & Salary:</p><p className="font-semibold text-gray-700">{profile.experienceYears} Years / {profile.currentSalary || '-'}</p></div>
                    <div><p className="text-gray-400">Resume:</p><p className="font-semibold text-gray-700">{profile.resumeUrl ? 'Uploaded ✅' : 'None Attached'}</p></div>
                    <div className="col-span-2"><p className="text-gray-400">Skills:</p><p className="font-semibold text-gray-700">{profile.skills.join(', ') || '-'}</p></div>
                  </div>
                )}
              </div>

              {/* Category 4: Education Details */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><GraduationCap size={15} className="text-emerald-500" /> Education Details</h3>
                  <button onClick={() => setCurrentStep(4)} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-bold"><Save size={12} /> Edit</button>
                </div>
                {profile.educationDetails.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No records added</p>
                ) : (
                  <div className="space-y-3">
                    {profile.educationDetails.map((edu, index) => (
                      <div key={index} className="text-xs border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                        <p className="font-bold text-gray-800">{edu.degree} in {edu.specialization} ({edu.startYear} - {edu.endYear})</p>
                        <p className="text-gray-400">{edu.institutionName} - {edu.percentageCgpa}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category 5: Hobbies & Interests */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Star size={15} className="text-yellow-500" /> Hobbies & Interests</h3>
                  <button onClick={() => setCurrentStep(5)} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-bold"><Save size={12} /> Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><p className="text-gray-400 font-bold mb-1">Hobbies:</p><p className="text-gray-700">{profile.hobbies.join(', ') || '-'}</p></div>
                  <div><p className="text-gray-400 font-bold mb-1">Interests:</p><p className="text-gray-700">{profile.interests.join(', ') || '-'}</p></div>
                </div>
              </div>

              {/* Category 6: Express Yourself */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Smile size={15} className="text-primary-500" /> Express Yourself</h3>
                  <button onClick={() => setCurrentStep(6)} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-bold"><Save size={12} /> Edit</button>
                </div>
                <div className="space-y-2 text-xs">
                  {profile.lookingFor && <div><p className="text-gray-400 font-bold">About Me:</p><p className="text-gray-700 mt-0.5 italic">"{profile.lookingFor}"</p></div>}
                  {profile.lifeGoals && <div><p className="text-gray-400 font-bold">Looking For:</p><p className="text-gray-700 mt-0.5">{profile.lifeGoals}</p></div>}
                  {profile.favoriteQuote && <div><p className="text-gray-400 font-bold">Favorite Quote:</p><p className="text-gray-700 mt-0.5 font-semibold">"{profile.favoriteQuote}"</p></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STICKY FOOTER NAVIGATION BUTTONS --- */}
        <div className="flex justify-between items-center border-t border-gray-150 pt-5 mt-6 gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSaving || saveMutation.isPending}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBackToSummary}
              disabled={isSaving || saveMutation.isPending}
              className="px-5 py-2.5 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Lock size={14} /> Back to Summary
            </button>
          )}

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSaving || saveMutation.isPending}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-primary-500/10 ml-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving || saveMutation.isPending ? 'Saving...' : 'Next'} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSaving || saveMutation.isPending}
              className="px-7 py-2.5 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary-500/25 ml-auto animate-pulse disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving || saveMutation.isPending ? 'Saving...' : 'Submit Profile'} <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
