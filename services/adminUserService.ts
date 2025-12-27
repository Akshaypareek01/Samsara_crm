import UserService, { User, UsersResponse, GetUsersParams } from './userService';

/**
 * AdminUserService
 * ----------------
 * Semantic wrapper around UserService for ADMIN screens.
 *
 * IMPORTANT:
 * - Does NOT introduce new endpoints
 * - Does NOT change backend behavior
 * - Uses existing /users APIs
 * - Exists only for code clarity in admin UI
 */
class AdminUserService {
  /**
   * Admin: get any user by ID
   * Endpoint used: GET /users/:userId
   */
  async getUserById(userId: string): Promise<User> {
    return UserService.getUserById(userId);
  }

  /**
   * Admin: list users with filters
   * Endpoint used: GET /users
   */
  async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    return UserService.getUsers(params);
  }

  /**
   * Admin: create user
   * Endpoint used: POST /users
   */
  async createUser(data: any): Promise<User> {
    return UserService.createUser(data);
  }

  /**
   * Admin: update user
   * Endpoint used: PATCH /users/:userId
   */
  async updateUser(userId: string, data: any): Promise<User> {
    return UserService.updateUser(userId, data);
  }

  /**
   * Admin: delete user
   * Endpoint used: DELETE /users/:userId
   */
  async deleteUser(userId: string): Promise<void> {
    return UserService.deleteUser(userId);
  }
}

export default new AdminUserService();
