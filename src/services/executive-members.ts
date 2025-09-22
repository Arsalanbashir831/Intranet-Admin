// TODO: Uncomment when backend is ready
// import apiCaller from "@/lib/api-caller";
// import { API_ROUTES } from "@/constants/api-routes";
// import type { paths, components } from "@/types/api";

export type ExecutiveMemberListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExecutiveMember[];
};

export type ExecutiveMemberDetailResponse = ExecutiveMember;

export type ExecutiveMemberCreateRequest = {
  name: string;
  email: string;
  role: string;
  address?: string;
  city?: string;
  phone?: string;
  profile_picture?: string;
  qualification_details?: string;
};

export type ExecutiveMemberCreateResponse = ExecutiveMember;

export type ExecutiveMemberUpdateRequest = {
  name?: string;
  email?: string;
  role?: string;
  address?: string;
  city?: string;
  phone?: string;
  profile_picture?: string;
  qualification_details?: string;
};

export type ExecutiveMemberUpdateResponse = ExecutiveMember;

export type ExecutiveMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  address?: string;
  city?: string;
  phone?: string;
  profile_picture?: string;
  qualification_details?: string;
  created_at: string;
  updated_at: string;
};

export async function listExecutiveMembers(_params?: Record<string, unknown>) {
  // TODO: Uncomment when backend is ready
  // const url = API_ROUTES.EXECUTIVE_MEMBERS.LIST;
  // const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  // const res = await apiCaller<ExecutiveMemberListResponse>(`${url}${query}`, "GET");
  // return res.data;

  // DUMMY DATA - Remove when backend is ready
  return new Promise<ExecutiveMemberListResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        count: 8,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: "Albert Flores",
            email: "Fisherman12@gmail.com",
            role: "Director",
            address: "123 Executive Plaza, Suite 100",
            city: "New York",
            phone: "+1-555-0101",
            profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>MBA from Harvard Business School with 15+ years of executive experience in strategic planning and corporate leadership.</p>",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah.johnson@company.com",
            role: "CEO",
            address: "456 Corporate Tower, Suite 200",
            city: "San Francisco",
            phone: "+1-555-0102",
            profile_picture: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>MBA from Stanford Graduate School of Business with 20+ years of leadership experience in technology companies.</p>",
            created_at: "2024-01-10T10:00:00Z",
            updated_at: "2024-01-10T10:00:00Z"
          },
          {
            id: 3,
            name: "Michael Chen",
            email: "michael.chen@company.com",
            role: "CTO",
            address: "789 Tech Center, Floor 15",
            city: "Boston",
            phone: "+1-555-0103",
            profile_picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>PhD in Computer Science from MIT with 18+ years of experience in software architecture and technology leadership.</p>",
            created_at: "2024-01-05T10:00:00Z",
            updated_at: "2024-01-05T10:00:00Z"
          },
          {
            id: 4,
            name: "Emily Rodriguez",
            email: "emily.rodriguez@company.com",
            role: "CFO",
            address: "321 Financial District, Suite 500",
            city: "Chicago",
            phone: "+1-555-0104",
            profile_picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>CPA with MBA in Finance from Wharton School, 16+ years of experience in corporate finance and strategic planning.</p>",
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z"
          },
          {
            id: 5,
            name: "David Kim",
            email: "david.kim@company.com",
            role: "VP of Sales",
            address: "654 Sales Plaza, Floor 8",
            city: "Los Angeles",
            phone: "+1-555-0105",
            profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>MBA from Kellogg School of Management with 14+ years of sales leadership and business development experience.</p>",
            created_at: "2023-12-28T10:00:00Z",
            updated_at: "2023-12-28T10:00:00Z"
          },
          {
            id: 6,
            name: "Lisa Wang",
            email: "lisa.wang@company.com",
            role: "VP of Marketing",
            address: "987 Creative Hub, Suite 300",
            city: "Seattle",
            phone: "+1-555-0106",
            profile_picture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>Master's in Marketing from Columbia Business School with 12+ years of brand management and digital marketing expertise.</p>",
            created_at: "2023-12-25T10:00:00Z",
            updated_at: "2023-12-25T10:00:00Z"
          },
          {
            id: 7,
            name: "James Wilson",
            email: "james.wilson@company.com",
            role: "VP of Operations",
            address: "147 Operations Center, Floor 12",
            city: "Denver",
            phone: "+1-555-0107",
            profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>MBA in Operations Management from INSEAD with 15+ years of experience in process optimization and supply chain management.</p>",
            created_at: "2023-12-20T10:00:00Z",
            updated_at: "2023-12-20T10:00:00Z"
          },
          {
            id: 8,
            name: "Maria Garcia",
            email: "maria.garcia@company.com",
            role: "VP of HR",
            address: "258 People Center, Suite 400",
            city: "Miami",
            phone: "+1-555-0108",
            profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60",
            qualification_details: "<p>Master's in Human Resources from Cornell ILR School with 13+ years of experience in talent management and organizational development.</p>",
            created_at: "2023-12-15T10:00:00Z",
            updated_at: "2023-12-15T10:00:00Z"
          }
        ]
      });
    }, 800);
  });
}

export async function getExecutiveMember(id: number | string) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<ExecutiveMemberDetailResponse>(API_ROUTES.EXECUTIVE_MEMBERS.DETAIL(id), "GET");
  // return res.data;

  // DUMMY DATA - Remove when backend is ready
  return new Promise<ExecutiveMemberDetailResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        name: `Executive Member ${id}`,
        email: `executive${id}@company.com`,
        role: "Executive",
        address: "123 Executive Plaza, Suite 100",
        city: "Sample City",
        phone: "+1-555-0000",
        profile_picture: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        qualification_details: "<p>Executive with extensive leadership experience and strategic vision.</p>",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z"
      });
    }, 500);
  });
}

export async function createExecutiveMember(payload: ExecutiveMemberCreateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<ExecutiveMemberCreateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.CREATE, "POST", payload, {}, "json");
  // return res.data;

  // DUMMY DATA - Remove when backend is ready
  return new Promise<ExecutiveMemberCreateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        role: payload.role,
        address: payload.address || "New Address",
        city: payload.city || "New City",
        phone: payload.phone || "+1-555-0000",
        profile_picture: payload.profile_picture || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        qualification_details: payload.qualification_details || "<p>New executive member qualifications.</p>",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
}

export async function updateExecutiveMember(id: number | string, payload: ExecutiveMemberUpdateRequest) {
  // TODO: Uncomment when backend is ready
  // const res = await apiCaller<ExecutiveMemberUpdateResponse>(API_ROUTES.EXECUTIVE_MEMBERS.UPDATE(id), "PUT", payload, {}, "json");
  // return res.data;

  // DUMMY DATA - Remove when backend is ready
  return new Promise<ExecutiveMemberUpdateResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        id: Number(id),
        name: payload.name || `Updated Executive ${id}`,
        email: payload.email || `updated${id}@company.com`,
        role: payload.role || "Executive",
        address: payload.address || "Updated Address",
        city: payload.city || "Updated City",
        phone: payload.phone || "+1-555-0000",
        profile_picture: payload.profile_picture || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        qualification_details: payload.qualification_details || "<p>Updated executive member qualifications.</p>",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
}

export async function deleteExecutiveMember(_id: number | string) {
  // TODO: Uncomment when backend is ready
  // await apiCaller<void>(API_ROUTES.EXECUTIVE_MEMBERS.DELETE(id), "DELETE");

  // DUMMY DATA - Remove when backend is ready
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}
