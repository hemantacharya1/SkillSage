import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '@/services/auth.service';
import { setUser, setToken, logout as logoutAction } from '@/redux/features/user/userSlice';
import { selectIsAuthenticated } from '@/redux/features/user/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { login: loginService, register, sendResetPasswordOtp, resetPassword, getProfile, loading } = useAuthService();

  const login = async (credentials) => {
    try {
      const response = await loginService(credentials);
      if (response.success) {
        dispatch(setToken(response.data.accessToken));
        dispatch(setUser(response.data.userResponse));
        
        // Role-based redirection
        const userRole = response.data.userResponse.role;
        if (userRole === 'RECRUITER') {
          navigate('/recruiter/dashboard');
        } else if (userRole === 'CANDIDATE') {
          navigate('/candidate/dashboard');
        } else {
          navigate('/auth/login');
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await register(userData);
      if (response.success) {
        navigate('/auth/verify-email');
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resetPasswordWithOtp = async (email, newPassword, otp) => {
    try {
      const response = await resetPassword(email, newPassword, otp);
      if (response.success) {
        navigate('/auth/login');
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await sendResetPasswordOtp(email);
      if (response.success) {
        navigate('/auth/reset-password');
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate('/auth/login');
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await getProfile();
      if (data?.success) {
        dispatch(setUser(data.data));
      }
      return { data, error };
    } catch (error) {
      throw error;
    }
  };

  return {
    login,
    register: registerUser,
    resetPassword: resetPasswordWithOtp,
    sendResetPasswordOtp: requestPasswordReset,
    logout,
    fetchProfile,
    isAuthenticated,
    loading
  };
}; 