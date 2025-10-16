"use client";

import React from "react";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";

interface ManagerAccessGuardProps {
  children: React.ReactNode;
  requiredPermission?: 'manage_employees' | 'create_announcements' | 'upload_knowledge' | 'assign_tasks' | 'view_analytics';
  requiredDepartmentId?: number;
  fallback?: React.ReactNode;
}

export function ManagerAccessGuard({ 
  children, 
  requiredPermission, 
  requiredDepartmentId,
  fallback 
}: ManagerAccessGuardProps) {
  const { 
    isManager, 
    isLoading, 
    canManageEmployees,
    canCreateAnnouncements,
    canUploadKnowledge,
    canAssignTasks,
    canViewAnalytics,
    validateDepartmentAccess 
  } = useManagerScope();

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading permissions...</span>
        </div>
      </Card>
    );
  }

  // Check if user is a manager
  if (!isManager) {
    const defaultFallback = (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have manager permissions to access this resource.
          </AlertDescription>
        </Alert>
      </Card>
    );
    return <>{fallback || defaultFallback}</>;
  }

  // Check specific permission if required
  if (requiredPermission) {
    let hasPermission = false;
    
    switch (requiredPermission) {
      case 'manage_employees':
        hasPermission = canManageEmployees;
        break;
      case 'create_announcements':
        hasPermission = canCreateAnnouncements;
        break;
      case 'upload_knowledge':
        hasPermission = canUploadKnowledge;
        break;
      case 'assign_tasks':
        hasPermission = canAssignTasks;
        break;
      case 'view_analytics':
        hasPermission = canViewAnalytics;
        break;
    }

    if (!hasPermission) {
      const defaultFallback = (
        <Card className="p-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to {requiredPermission.replace('_', ' ')}.
            </AlertDescription>
          </Alert>
        </Card>
      );
      return <>{fallback || defaultFallback}</>;
    }
  }

  // Check department access if required
  if (requiredDepartmentId && !validateDepartmentAccess(requiredDepartmentId)) {
    const defaultFallback = (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have access to this department.
          </AlertDescription>
        </Alert>
      </Card>
    );
    return <>{fallback || defaultFallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
}

interface ManagerScopeInfoProps {
  className?: string;
}

export function ManagerScopeInfo({ className }: ManagerScopeInfoProps) {
  const { 
    isManager, 
    isLoading, 
    getManagedDepartmentNames,
    canManageEmployees,
    canCreateAnnouncements,
    canUploadKnowledge,
    canAssignTasks,
    canViewAnalytics
  } = useManagerScope();

  if (isLoading) {
    return (
      <Card className={`p-4 ${className || ''}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          <span className="text-sm text-muted-foreground">Loading manager info...</span>
        </div>
      </Card>
    );
  }

  if (!isManager) {
    return null;
  }

  const managedDepartments = getManagedDepartmentNames();
  const permissions = [
    { name: 'Manage Employees', has: canManageEmployees },
    { name: 'Create Announcements', has: canCreateAnnouncements },
    { name: 'Upload Knowledge', has: canUploadKnowledge },
    { name: 'Assign Tasks', has: canAssignTasks },
    { name: 'View Analytics', has: canViewAnalytics },
  ].filter(p => p.has);

  return (
    <Card className={`p-4 ${className || ''}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Manager Access</span>
        </div>
        
        {managedDepartments.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Managed Departments:</p>
            <div className="flex flex-wrap gap-1">
              {managedDepartments.map((dept, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {permissions.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Permissions:</p>
            <div className="flex flex-wrap gap-1">
              {permissions.map((permission, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"
                >
                  {permission.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
