import { useMutation } from "@tanstack/react-query";
import { persistAuth } from "../../lib/auth";
import { getHttpErrorMessage } from "../../lib/httpError";
import { useNavigate } from "react-router-dom";
import type { LoginResponse, GoogleAuthResponse, SignupResponse } from "@repo/types/api";
import { http } from "../../https";

export function useLogin(setErrorMessage: (msg: string | null) => void) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await http.post<LoginResponse>("/user/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      persistAuth(data.token, data.name);
      navigate("/dashboard");
    },
    onError: (error) => {
      setErrorMessage(
        getHttpErrorMessage(error, "Could not sign you in. Check your email and password.")
      );
    },
  });
}

export function useSignup(setErrorMessage: (msg: string | null) => void) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await http.post<SignupResponse>("/user/signup", { name, email, password });
      return response.data;
    },
    onSuccess: (data, variables) => {
      persistAuth(data.token, variables.name);
      navigate("/dashboard");
    },
    onError: (error) => {
      setErrorMessage(getHttpErrorMessage(error, "Could not create your account. Try a different email."));
    },
  });
}

export function useGoogleAuth(setErrorMessage: (msg: string | null) => void) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (idToken: string) => {
      const response = await http.post<GoogleAuthResponse>("/google/auth", { idToken });
      return response.data;
    },
    onSuccess: (data) => {
      persistAuth(data.token, data.name);
      navigate("/dashboard");
    },
    onError: (error) => {
      setErrorMessage(getHttpErrorMessage(error, "Google authentication failed. Please try again."));
    },
  });
}
