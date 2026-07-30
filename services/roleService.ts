import ApiService from './ApiService';

export interface Role {
    id: string;
    _id?: string;
    name: string;
    permissions: {
        dashboard: { read: boolean };
        userManagement: {
            users: { create: boolean; read: boolean; update: boolean; delete: boolean };
            teachers: { create: boolean; read: boolean; update: boolean; delete: boolean };
            trainers: { create: boolean; read: boolean; update: boolean; delete: boolean };
        };
        companyManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
        bookingManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
        membershipManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
        classManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
        digitalMarketing: {
            contacts: { create: boolean; read: boolean; update: boolean; delete: boolean };
            email: { create: boolean; read: boolean; update: boolean; delete: boolean };
            whatsapp: { create: boolean; read: boolean; update: boolean; delete: boolean };
        };
        eventManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
        support: { create: boolean; read: boolean; update: boolean; delete: boolean };
        roleManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
        teamManagement: { create: boolean; read: boolean; update: boolean; delete: boolean };
    };
}

class RoleService {
    async getAllRoles(): Promise<Role[]> {
        const response = await ApiService.get('/roles');
        // Handle different response structures
        if (Array.isArray(response)) return response;
        if (response.data && Array.isArray(response.data)) return response.data;
        if (response.results && Array.isArray(response.results)) return response.results;
        if (response.roles && Array.isArray(response.roles)) return response.roles;
        return [];
    }

    async createRole(data: any): Promise<Role> {
        return await ApiService.post('/roles', data);
    }

    async updateRole(roleId: string, data: any): Promise<Role> {
        return await ApiService.patch(`/roles/${roleId}`, data);
    }

    async deleteRole(roleId: string): Promise<any> {
        return await ApiService.delete(`/roles/${roleId}`);
    }

    getDefaultPermissions() {
        return {
            dashboard: { read: false },
            userManagement: {
                users: { create: false, read: false, update: false, delete: false },
                teachers: { create: false, read: false, update: false, delete: false },
                trainers: { create: false, read: false, update: false, delete: false },
            },
            companyManagement: { create: false, read: false, update: false, delete: false },
            bookingManagement: { create: false, read: false, update: false, delete: false },
            membershipManagement: { create: false, read: false, update: false, delete: false },
            classManagement: { create: false, read: false, update: false, delete: false },
            digitalMarketing: {
                contacts: { create: false, read: false, update: false, delete: false },
                email: { create: false, read: false, update: false, delete: false },
                whatsapp: { create: false, read: false, update: false, delete: false },
            },
            eventManagement: { create: false, read: false, update: false, delete: false },
            support: { create: false, read: false, update: false, delete: false },
            roleManagement: { create: false, read: false, update: false, delete: false },
            teamManagement: { create: false, read: false, update: false, delete: false },
        };
    }
}

export default new RoleService();
