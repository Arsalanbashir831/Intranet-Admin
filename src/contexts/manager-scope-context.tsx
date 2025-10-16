"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { getManagerScope, getManagerProfile } from "../services/manager-scope";
import type { ManagerScope, ManagerScopeContextType, EmployeeWithScope, ManagerEmployeeAccessCheck } from "@/types/manager-scope";

const ManagerScopeContext = createContext<ManagerScopeContextType | undefined>(undefined);

export function ManagerScopeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [managerScope, setManagerScope] = useState<ManagerScope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<EmployeeWithScope | null>(null);

  // Check if user is an admin (full access) or manager (role-based access)
  const isAdmin = employeeData?.isAdmin ?? false;
  const isManager = isAdmin ? false : (managerScope?.is_manager ?? false);
  const managedDepartments = isAdmin ? [] : (managerScope?.managed_departments ?? []);
  
  // Permission flags - Admins have all permissions, managers are restricted
  const canManageEmployees = isAdmin ? true : (managerScope?.permissions.can_manage_employees ?? false);
  const canCreateAnnouncements = isAdmin ? true : (managerScope?.permissions.can_create_announcements ?? false);
  const canUploadKnowledge = isAdmin ? true : (managerScope?.permissions.can_upload_knowledge ?? false);
  const canAssignTasks = isAdmin ? true : (managerScope?.permissions.can_assign_tasks ?? false);
  const canViewAnalytics = isAdmin ? true : (managerScope?.permissions.can_view_analytics ?? false);

  // Fetch manager scope when user is authenticated
  useEffect(() => {
    const fetchManagerScope = async () => {
      if (!isAuthenticated || !user) {
        setManagerScope(null);
        setEmployeeData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get both employee data and scope
        const profileData = await getManagerProfile();
        
        // Store employee data (contains isAdmin flag)
        setEmployeeData(profileData.employee);
        
        // Only set manager scope if user is not an admin
        if (!profileData.employee?.isAdmin) {
          // If manager_scope exists in response, use it
          if (profileData.manager_scope) {
            setManagerScope(profileData.manager_scope);
          } else {
            // If no manager_scope but role is "Manager", create a basic scope from employee data
            if (profileData.employee?.role === "Manager" && profileData.employee?.branch_department_ids) {
              const basicScope: ManagerScope = {
                is_manager: true,
                managed_departments: profileData.employee.branch_department_ids,
                managed_departments_details: profileData.employee.branch_departments || [],
                permissions: {
                  can_manage_employees: true,
                  can_create_announcements: true,
                  can_upload_knowledge: true,
                  can_assign_tasks: true,
                  can_view_analytics: true,
                }
              };
              setManagerScope(basicScope);
            } else {
              setManagerScope(null);
            }
          }
        } else {
          setManagerScope(null); // Admins don't need manager scope
        }
      } catch (error) {
        console.error("Failed to fetch manager profile:", error);
        // Fallback: try to get just the scope
        try {
          const scope = await getManagerScope();
          setManagerScope(scope);
        } catch {
          setManagerScope(null);
        }
        setEmployeeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagerScope();
  }, [isAuthenticated, user]);

  // Validate if manager can access a specific department
  const validateDepartmentAccess = (departmentId: number): boolean => {
    // Admins have access to all departments
    if (isAdmin) {
      return true;
    }
    
    if (!isManager || !managerScope) {
      return false;
    }
    return managedDepartments.includes(departmentId);
  };

  // Validate if manager can access a specific employee
  const validateEmployeeAccess = (employee: EmployeeWithScope): boolean => {
    // Admins have access to all employees
    if (isAdmin) {
      return true;
    }
    
    if (!isManager || !managerScope) {
      return false;
    }
    
    // Check if employee belongs to any of manager's departments
    return employee.branch_department_ids.some(id => managedDepartments.includes(id));
  };

  // Get names of managed departments
  const getManagedDepartmentNames = (): string[] => {
    if (!managerScope?.managed_departments_details) {
      return [];
    }
    
    return managerScope.managed_departments_details.map(dept => 
      `${dept.branch.branch_name} - ${dept.department.dept_name}`
    );
  };

  // Get IDs of managed employees (for strict access control)
  const getManagedEmployeeIds = (): number[] => {
    if (!isManager || !managerScope) {
      return [];
    }
    // This would need to be fetched from the API based on managed departments
    // For now, return empty array - this will be populated by API calls
    return [];
  };

  // Validate if manager owns a specific employee
  const validateEmployeeOwnership = (employeeId: number): ManagerEmployeeAccessCheck => {
    // Admins own all employees
    if (isAdmin) {
      return {
        canAccess: true,
        reason: "Admin has full access",
        employeeId,
        isOwnEmployee: true,
        managedDepartments: []
      };
    }
    
    if (!isManager || !managerScope) {
      return {
        canAccess: false,
        reason: "Not a manager",
        employeeId,
        isOwnEmployee: false,
        managedDepartments: []
      };
    }

    // This would need to check if the employee belongs to manager's departments
    // For now, return false - this will be implemented with API validation
    return {
      canAccess: false,
      reason: "Employee not in managed departments",
      employeeId,
      isOwnEmployee: false,
      managedDepartments
    };
  };

  // Validate if manager can access a specific resource
  const validateResourceAccess = (resourceType: 'announcement' | 'knowledge' | 'employee', resourceId: number): boolean => {
    // Admins can access all resources
    if (isAdmin) {
      return true;
    }
    
    if (!isManager || !managerScope) {
      return false;
    }

    // For employees, check if they belong to managed departments
    if (resourceType === 'employee') {
      return validateEmployeeOwnership(resourceId).canAccess;
    }

    // For announcements and knowledge, check if they were created by managed employees
    // This would need API validation to check ownership
    return false;
  };

  const value: ManagerScopeContextType = {
    managerScope,
    isLoading,
    isManager,
    managedDepartments,
    canManageEmployees,
    canCreateAnnouncements,
    canUploadKnowledge,
    canAssignTasks,
    canViewAnalytics,
    validateDepartmentAccess,
    validateEmployeeAccess,
    validateEmployeeOwnership,
    validateResourceAccess,
    getManagedDepartmentNames,
    getManagedEmployeeIds,
  };

  return (
    <ManagerScopeContext.Provider value={value}>
      {children}
    </ManagerScopeContext.Provider>
  );
}

export function useManagerScope() {
  const context = useContext(ManagerScopeContext);
  if (context === undefined) {
    throw new Error("useManagerScope must be used within a ManagerScopeProvider");
  }
  return context;
}
