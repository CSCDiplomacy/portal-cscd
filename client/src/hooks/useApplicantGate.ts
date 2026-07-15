import { useAuthStore } from '../stores/authStore';

/**
 * Determine if the user is an applicant (unenrolled) or enrolled delegate
 * Returns { isApplicant, isEnrolled }
 */
export const useApplicantGate = () => {
  const { user } = useAuthStore();

  const isApplicant = user?.status === 'unenrolled';
  const isEnrolled = user?.status === 'enrolled';

  return {
    isApplicant,
    isEnrolled,
    showInterview: isApplicant,
  };
};
