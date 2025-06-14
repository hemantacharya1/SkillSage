import useMutation from '@/hooks/useMutation';
import useQuery from '@/hooks/useQuery';
import { API_CONFIG } from '@/config/api.config';

export const useAuthService = () => {
  const loginMutation = useMutation();
  const registerMutation = useMutation();
  const resetPasswordOtpMutation = useMutation();
  const resetPasswordMutation = useMutation();
  const profileQuery = useQuery();

  const login = async (credentials) => {
    return loginMutation.mutate({
      url: API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      method: 'POST',
      data: credentials,
      skipToken: true
    });
  };

  const register = async (userData) => {
    return registerMutation.mutate({
      url: API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      method: 'POST',
      data: userData,
      skipToken: true
    });
  };

  const sendResetPasswordOtp = async (email) => {
    return resetPasswordOtpMutation.mutate({
      url: API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD_OTP,
      method: 'POST',
      params: { email },
      skipToken: true
    });
  };

  const resetPassword = async (email, newPassword, otp) => {
    return resetPasswordMutation.mutate({
      url: API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      method: 'POST',
      params: { email, newPassword, otp },
      skipToken: true
    });
  };

  const getProfile = (skip = false) => {
    return profileQuery(API_CONFIG.ENDPOINTS.AUTH.PROFILE, { skip });
  };

  return {
    login,
    register,
    sendResetPasswordOtp,
    resetPassword,
    getProfile,
    loading: loginMutation.loading || registerMutation.loading || 
            resetPasswordOtpMutation.loading || resetPasswordMutation.loading
  };
}; 