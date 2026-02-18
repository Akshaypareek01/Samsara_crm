import ApiService from './ApiService';
import { Role } from './roleService';

export interface TeamMember {
    id: string;
    _id?: string;
    name: string;
    email: string;
    /** Populated role object (if API populates it), or backend may only send roleId */
    role?: Role | string;
    roleId?: string;
    createdAt?: string;
}

class TeamService {
    async getTeamMembers(): Promise<TeamMember[]> {
        const response = await ApiService.get('/admin/team');
        // Handle different response structures
        if (Array.isArray(response)) return response;
        if (response.data && Array.isArray(response.data)) return response.data;
        if (response.results && Array.isArray(response.results)) return response.results;
        if (response.members && Array.isArray(response.members)) return response.members;
        return [];
    }

    async createTeamMember(data: any): Promise<TeamMember> {
        return await ApiService.post('/admin/team', data);
    }

    async updateTeamMember(adminId: string, data: any): Promise<TeamMember> {
        return await ApiService.patch(`/admin/team/${adminId}`, data);
    }

    async deleteTeamMember(adminId: string): Promise<any> {
        return await ApiService.delete(`/admin/team/${adminId}`);
    }
}

export default new TeamService();
