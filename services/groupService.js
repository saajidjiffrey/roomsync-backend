const Group = require('../models/Group');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

class GroupService {
  // Create a new group
  async createGroup(groupData, userId) {
    try {
      const group = await Group.create(groupData);
      
      // Add the creator to the group
      if (userId) {
        const tenant = await Tenant.findOne({
          where: { user_id: userId }
        });
        
        if (tenant) {
          await tenant.update({ group_id: group.id });
        }
      }
      
      // Return the group with full details
      const fullGroup = await Group.findByPk(group.id, {
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });

      return {
        ...fullGroup.toJSON(),
        is_joined: true,
        member_count: fullGroup.tenants.length
      };
    } catch (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  // Get all groups for a property
  async getGroupsByProperty(propertyId, userId = null) {
    try {
      const groups = await Group.findAll({
        where: { property_id: propertyId },
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });

      // If userId is provided, mark which groups the user has joined
      if (userId) {
        const groupsWithJoinStatus = groups.map(group => {
          const isJoined = group.tenants.some(t => t.user_id === userId);
          return {
            ...group.toJSON(),
            is_joined: isJoined,
            member_count: group.tenants.length
          };
        });
        return groupsWithJoinStatus;
      }

      return groups;
    } catch (error) {
      throw new Error(`Failed to get groups: ${error.message}`);
    }
  }

  // Get a specific group by ID
  async getGroupById(groupId) {
    try {
      const group = await Group.findByPk(groupId, {
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return group;
    } catch (error) {
      throw new Error(`Failed to get group: ${error.message}`);
    }
  }

  // Update a group
  async updateGroup(groupId, updateData) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      await group.update(updateData);
      return group;
    } catch (error) {
      throw new Error(`Failed to update group: ${error.message}`);
    }
  }

  // Delete a group
  async deleteGroup(groupId) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      await group.destroy();
      return { message: 'Group deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }

  // Add a tenant to a group
  async addTenantToGroup(groupId, tenantId) {
    try {
      const tenant = await Tenant.findByPk(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if tenant is already in a group
      if (tenant.group_id) {
        throw new Error('Tenant is already in a group');
      }
      
      await tenant.update({ group_id: groupId });
      return tenant;
    } catch (error) {
      throw new Error(`Failed to add tenant to group: ${error.message}`);
    }
  }

  // Remove a tenant from a group
  async removeTenantFromGroup(groupId, tenantId) {
    try {
      const tenant = await Tenant.findOne({
        where: { id: tenantId, group_id: groupId }
      });
      
      if (!tenant) {
        throw new Error('Tenant not found in this group');
      }
      
      await tenant.update({ group_id: null });
      return tenant;
    } catch (error) {
      throw new Error(`Failed to remove tenant from group: ${error.message}`);
    }
  }

  // Get tenants in a group
  async getGroupTenants(groupId) {
    try {
      const tenants = await Tenant.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: User,
            as: 'tenantUser',
            attributes: ['id', 'full_name', 'email', 'phone_no']
          }
        ]
      });
      return tenants;
    } catch (error) {
      throw new Error(`Failed to get group tenants: ${error.message}`);
    }
  }

  // Get groups that the current user has joined
  async getMyGroups(userId) {
    try {
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      const groups = await Group.findAll({
        where: { property_id: tenant.property_id },
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });

      // Mark which groups the user has joined
      const groupsWithJoinStatus = groups.map(group => {
        const isJoined = group.tenants.some(t => t.user_id === userId);
        return {
          ...group.toJSON(),
          is_joined: isJoined,
          member_count: group.tenants.length
        };
      });

      return groupsWithJoinStatus;
    } catch (error) {
      throw new Error(`Failed to get my groups: ${error.message}`);
    }
  }

  // Join a group
  async joinGroup(groupId, userId) {
    try {
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      // Check if the group exists and is in the same property
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.property_id !== tenant.property_id) {
        throw new Error('You can only join groups in your property');
      }

      // Check if user is already in the group
      const existingTenant = await Tenant.findOne({
        where: { 
          user_id: userId,
          group_id: groupId
        }
      });

      if (existingTenant) {
        throw new Error('You are already a member of this group');
      }

      // Add the tenant to the group
      await tenant.update({ group_id: groupId });

      // Return the updated group with member info
      const updatedGroup = await Group.findByPk(groupId, {
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });

      return {
        ...updatedGroup.toJSON(),
        is_joined: true,
        member_count: updatedGroup.tenants.length
      };
    } catch (error) {
      throw new Error(`Failed to join group: ${error.message}`);
    }
  }

  // Leave a group
  async leaveGroup(groupId, userId) {
    try {
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      if (tenant.group_id !== parseInt(groupId)) {
        throw new Error('You are not a member of this group');
      }

      // Remove the tenant from the group
      await tenant.update({ group_id: null });

      return true;
    } catch (error) {
      throw new Error(`Failed to leave group: ${error.message}`);
    }
  }
}

module.exports = new GroupService();

