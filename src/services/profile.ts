// TODO: Uncomment when backend is ready
// import { api } from "@/lib/api";
// import { API_ROUTES } from "@/constants/api-routes";

// Types based on the API schema
export interface UserProfile {
  readonly id: number;
  username: string;
  readonly email: string;
  first_name?: string;
  last_name?: string;
  readonly full_name: string;
  phone_number?: string;
  gender?: "M" | "F" | "O" | "";
  date_of_birth?: string | null;
  city?: string;
  country?: string;
  postal_code?: string;
  readonly role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  readonly status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  about?: string;
  profile_picture?: string | null;
  readonly profile_picture_url: string;
  readonly email_verified: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: "M" | "F" | "O" | "";
  date_of_birth?: string | null;
  city?: string;
  country?: string;
  postal_code?: string;
  about?: string;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
  users_by_role: {
    admin: number;
    manager: number;
    employee: number;
  };
}

// Profile service functions
export const getProfile = async (): Promise<UserProfile> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.get(API_ROUTES.PROFILE.GET);
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<UserProfile>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        username: "admin",
        email: "admin@company.com",
        first_name: "Admin",
        last_name: "User",
        full_name: "Admin User",
        phone_number: "+1-555-0000",
        gender: "M",
        date_of_birth: "1990-01-01",
        city: "New York",
        country: "USA",
        postal_code: "10001",
        role: "ADMIN",
        status: "ACTIVE",
        about: "System administrator with full access to all features.",
        profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        profile_picture_url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        email_verified: true,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z"
      });
    }, 600);
  });
};

export const updateProfile = async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.put(API_ROUTES.PROFILE.UPDATE, data);
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<UserProfile>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        username: "admin",
        email: "admin@company.com",
        first_name: data.first_name || "Admin",
        last_name: data.last_name || "User",
        full_name: `${data.first_name || "Admin"} ${data.last_name || "User"}`,
        phone_number: data.phone_number || "+1-555-0000",
        gender: data.gender || "M",
        date_of_birth: data.date_of_birth || "1990-01-01",
        city: data.city || "New York",
        country: data.country || "USA",
        postal_code: data.postal_code || "10001",
        role: "ADMIN",
        status: "ACTIVE",
        about: data.about || "Updated profile information.",
        profile_picture: "/avatars/admin-user.jpg",
        profile_picture_url: "/avatars/admin-user.jpg",
        email_verified: true,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: new Date().toISOString()
      });
    }, 800);
  });
};

export const updateProfilePartial = async (data: Partial<UserProfileUpdateRequest>): Promise<UserProfile> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.patch(API_ROUTES.PROFILE.UPDATE, data);
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<UserProfile>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        username: "admin",
        email: "admin@company.com",
        first_name: data.first_name || "Admin",
        last_name: data.last_name || "User",
        full_name: `${data.first_name || "Admin"} ${data.last_name || "User"}`,
        phone_number: data.phone_number || "+1-555-0000",
        gender: data.gender || "M",
        date_of_birth: data.date_of_birth || "1990-01-01",
        city: data.city || "New York",
        country: data.country || "USA",
        postal_code: data.postal_code || "10001",
        role: "ADMIN",
        status: "ACTIVE",
        about: data.about || "Partially updated profile information.",
        profile_picture: "/avatars/admin-user.jpg",
        profile_picture_url: "/avatars/admin-user.jpg",
        email_verified: true,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: new Date().toISOString()
      });
    }, 700);
  });
};

export const getExtendedProfile = async (): Promise<unknown> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.get(API_ROUTES.PROFILE.EXTENDED);
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<unknown>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        username: "admin",
        email: "admin@company.com",
        first_name: "Admin",
        last_name: "User",
        full_name: "Admin User",
        phone_number: "+1-555-0000",
        gender: "M",
        date_of_birth: "1990-01-01",
        city: "New York",
        country: "USA",
        postal_code: "10001",
        role: "ADMIN",
        status: "ACTIVE",
        about: "Extended profile information with additional details.",
        profile_picture: "/avatars/admin-user.jpg",
        profile_picture_url: "/avatars/admin-user.jpg",
        email_verified: true,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
        extended_data: {
          preferences: {
            theme: "light",
            notifications: true,
            language: "en"
          },
          permissions: ["read", "write", "admin"],
          last_login: "2024-01-15T10:00:00Z"
        }
      });
    }, 500);
  });
};

export const createExtendedProfile = async (data: unknown): Promise<unknown> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.post(API_ROUTES.PROFILE.EXTENDED, data);
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<unknown>((resolve) => {
    setTimeout(() => {
      // Fix: Avoid spreading a possibly non-object type (unknown) and ensure data is an object
      const safeData = (typeof data === 'object' && data !== null) ? data : {};
      resolve({
        id: Date.now(),
        ...safeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 900);
  });
};

export const getProfilePicture = async (): Promise<Blob> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.get(API_ROUTES.PROFILE.PICTURE, {
  //   responseType: 'blob'
  // });
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<Blob>((resolve) => {
    setTimeout(() => {
      // Create a dummy blob (empty image)
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Profile', 50, 50);
      }
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      });
    }, 300);
  });
};

export const uploadProfilePicture = async (file: File): Promise<unknown> => {
  // TODO: Uncomment when backend is ready
  // const formData = new FormData();
  // formData.append('profile_picture', file);
  // 
  // const response = await api.post(API_ROUTES.PROFILE.PICTURE, formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //   },
  // });
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<unknown>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        filename: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 1200);
  });
};

export const deleteProfilePicture = async (): Promise<void> => {
  // TODO: Uncomment when backend is ready
  // await api.delete(API_ROUTES.PROFILE.PICTURE);
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 400);
  });
};

export const getUserStatistics = async (): Promise<UserStatistics> => {
  // TODO: Uncomment when backend is ready
  // const response = await api.get(API_ROUTES.PROFILE.STATISTICS);
  // return response.data;
  
  // DUMMY DATA - Remove when backend is ready
  return new Promise<UserStatistics>((resolve) => {
    setTimeout(() => {
      resolve({
        total_users: 150,
        active_users: 142,
        inactive_users: 8,
        new_users_this_month: 12,
        users_by_role: {
          admin: 5,
          manager: 25,
          employee: 120
        }
      });
    }, 500);
  });
};
