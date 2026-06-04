import axios from "axios";
import { toast } from "sonner";

// ─── Axios instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error || error.message || "Une erreur est survenue";

    switch (status) {
      case 401:
        toast.error("Session expirée — veuillez vous reconnecter");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        break;

      case 403:
        toast.error(
          "Accès refusé — vous n'avez pas les permissions nécessaires",
        );
        break;

      case 404:
        // handled per-component
        break;

      case 422:
        // Validation errors — handled per-component
        break;

      case 429: {
        // Rate limiting — extract retry time
        const retryMatch = message.match(/(\d+)\s*secondes?/i);
        const minutes = retryMatch
          ? Math.ceil(parseInt(retryMatch[1]) / 60)
          : null;
        const timeMsg = minutes
          ? `Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}`
          : "Réessayez plus tard";

        toast.error(`🔒 Trop de tentatives — ${timeMsg}`, {
          duration: 8000,
          description:
            "Pour votre sécurité, l'accès est temporairement bloqué.",
        });
        break;
      }

      case 500:
      case 502:
      case 503:
        toast.error("Erreur serveur — notre équipe a été notifiée", {
          description: "Veuillez réessayer dans quelques instants.",
        });
        break;

      default:
        if (status >= 500) {
          toast.error(message);
        }
        break;
    }

    return Promise.reject(error);
  },
);

// ─── Helper methods ────────────────────────────────────────────────────────────
export const api = {
  get: (url, config) => apiClient.get(url, config).then((r) => r.data),
  post: (url, data, config) =>
    apiClient.post(url, data, config).then((r) => r.data),
  put: (url, data, config) =>
    apiClient.put(url, data, config).then((r) => r.data),
  patch: (url, data, config) =>
    apiClient.patch(url, data, config).then((r) => r.data),
  delete: (url, config) => apiClient.delete(url, config).then((r) => r.data),
};

export default apiClient;
