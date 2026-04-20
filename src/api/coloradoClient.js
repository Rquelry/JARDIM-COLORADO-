/* eslint-disable no-undef, no-unused-vars, no-implicit-any, no-property-does-not-exist */
// @ts-nocheck
/* eslint-disable-next-line */
import axios from "axios";
import { appParams } from "../lib/app-params.js";

/**
 * Cliente Colorado - Solução própria de autenticação e requisições
 * Substitui as dependências @base44/sdk
 */

// Criar instância do axios com configurações padrão
const createAxiosInstance = (baseURL = "") => {
  const instance = axios.create({
    baseURL: baseURL || appParams.appBaseUrl || "/api",
    headers: {
      "Content-Type": "application/json",
      "X-App-Id": appParams.appId,
    },
    timeout: 30000,
  });

  // Autenticação removida - sem token necessário

  // Interceptador de resposta para tratamento de erros
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const errorData = error.response?.data || {};
      const status = error.response?.status;

      const customError = new Error(errorData.message || error.message);
      customError.status = status;
      customError.data = errorData;
      customError.extra_data = errorData.extra_data;

      throw customError;
    },
  );

  return instance;
};

/**
 * Cliente público para requisições sem autenticação
 */
export const publicClient = createAxiosInstance("/api/apps/public");

/**
 * Cliente autenticado para requisições com autenticação
 */
export const authenticatedClient = createAxiosInstance();

/**
 * Cliente Colorado com métodos de autenticação
 */
export const colorado = {
  /**
   * Métodos genéricos de requisição
   */
  get: (url, config) => authenticatedClient.get(url, config),
  post: (url, data, config) => authenticatedClient.post(url, data, config),
  put: (url, data, config) => authenticatedClient.put(url, data, config),
  patch: (url, data, config) => authenticatedClient.patch(url, data, config),
  delete: (url, config) => authenticatedClient.delete(url, config),

  /**
   * Versão pública dos métodos
   */
  public: {
    get: (url, config) => publicClient.get(url, config),
    post: (url, data, config) => publicClient.post(url, data, config),
    put: (url, data, config) => publicClient.put(url, data, config),
    patch: (url, data, config) => publicClient.patch(url, data, config),
    delete: (url, config) => publicClient.delete(url, config),
  },
};

/**
 * Função para criar cliente customizado (compatível com a API anterior)
 */
export const createAxiosClient = (config = {}) => {
  const { baseURL, headers = {}, token, interceptResponses = true } = config;

  const instance = axios.create({
    baseURL: baseURL || appParams.appBaseUrl || "/api",
    headers: {
      "Content-Type": "application/json",
      "X-App-Id": appParams.appId,
      ...headers,
    },
    timeout: 30000,
  });

  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  if (interceptResponses) {
    instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const errorData = error.response?.data || {};
        const status = error.response?.status;

        const customError = new Error(errorData.message || error.message);
        customError.status = status;
        customError.data = errorData;
        customError.extra_data = errorData.extra_data;

        throw customError;
      },
    );
  }

  return instance;
};

export default colorado;
