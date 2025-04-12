export const secureApiCall = (endpoint, options = {}, token) => {
    if (!token) throw new Error("User not authenticated");
  
    const isFormData = options.body instanceof FormData;
  
    return fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        // Only set Content-Type if it's NOT FormData
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  };
  