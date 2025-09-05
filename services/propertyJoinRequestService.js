const PropertyJoinRequest = require('../models/PropertyJoinRequest');
const PropertyAd = require('../models/PropertyAd');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Owner = require('../models/Owner');
const User = require('../models/User');
const sequelize = require('../configs/database');

class PropertyJoinRequestService {
  /**
   * Create a property join request
   * @param {Object} requestData - Request data
   * @param {number} userId - Tenant's user ID
   * @returns {Object} Created request
   */
  async createJoinRequest(requestData, userId) {
    try {
      // Verify user exists and has tenant role
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role !== 'tenant' && user.role !== 'admin') {
        throw new Error('Only tenants can create join requests');
      }

      // Get or create tenant record
      let tenant = await Tenant.findOne({ where: { user_id: userId } });
      if (!tenant) {
        tenant = await Tenant.create({ user_id: userId });
      }

      // Verify property ad exists and is active
      const propertyAd = await PropertyAd.findByPk(requestData.property_ad_id, {
        include: [{
          model: Property,
          as: 'property'
        }]
      });
      
      if (!propertyAd) {
        throw new Error('Property ad not found');
      }

      if (!propertyAd.is_active) {
        throw new Error('This property ad is no longer active');
      }

      // Check if request already exists
      const existingRequest = await PropertyJoinRequest.findOne({
        where: {
          property_ad_id: requestData.property_ad_id,
          tenant_id: tenant.id
        }
      });

      if (existingRequest) {
        throw new Error('Join request already exists for this property ad');
      }

      const joinRequest = await PropertyJoinRequest.create({
        property_ad_id: requestData.property_ad_id,
        tenant_id: tenant.id,
        move_in_date: requestData.move_in_date
      });

      return await this.getJoinRequestById(joinRequest.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get join request by ID
   * @param {number} requestId - Request ID
   * @returns {Object} Join request with details
   */
  async getJoinRequestById(requestId) {
    try {
      const request = await PropertyJoinRequest.findByPk(requestId, {
        include: [
          {
            model: PropertyAd,
            as: 'propertyAd',
            include: [{
              model: Property,
              as: 'property'
            }]
          },
          {
            model: Tenant,
            as: 'tenant',
            include: [{
              model: User,
              as: 'tenantUser',
              attributes: ['id', 'full_name', 'email', 'phone_no']
            }]
          }
        ]
      });

      if (!request) {
        throw new Error('Join request not found');
      }

      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get join requests for a property ad (owner view)
   * @param {number} propertyAdId - Property Ad ID
   * @param {number} userId - Owner's user ID
   * @returns {Array} Array of join requests
   */
  async getJoinRequestsForPropertyAd(propertyAdId, userId) {
    try {
      // Verify user is the property owner or admin
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const propertyAd = await PropertyAd.findByPk(propertyAdId, {
        include: [{
          model: Property,
          as: 'property'
        }]
      });
      
      if (!propertyAd) {
        throw new Error('Property ad not found');
      }

      if (user.role !== 'admin') {
        const owner = await Owner.findOne({ where: { user_id: userId } });
        if (!owner || propertyAd.property.owner_id !== owner.id) {
          throw new Error('Only the property owner or admin can view join requests');
        }
      }

      const requests = await PropertyJoinRequest.findAll({
        where: { property_ad_id: propertyAdId },
        include: [
          {
            model: Tenant,
            as: 'tenant',
            include: [{
              model: User,
              as: 'tenantUser',
              attributes: ['id', 'full_name', 'email', 'phone_no']
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get join requests by tenant (tenant view)
   * @param {number} userId - Tenant's user ID
   * @returns {Array} Array of join requests
   */
  async getJoinRequestsByTenant(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const tenant = await Tenant.findOne({ where: { user_id: userId } });
      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      const requests = await PropertyJoinRequest.findAll({
        where: { tenant_id: tenant.id },
        include: [
          {
            model: PropertyAd,
            as: 'propertyAd',
            include: [{
              model: Property,
              as: 'property'
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get join requests received by owner across all their property ads (owner view)
   * @param {number} userId - Owner's user ID
   * @returns {Array} Array of join requests
   */
  async getJoinRequestsByOwner(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        throw new Error('Owner record not found');
      }

      const whereOwnerProperty = { owner_id: owner.id };

      // Use raw SQL query to ensure proper filtering by owner
      const results = await sequelize.query(`
        SELECT 
          pjr.id,
          pjr.status,
          pjr.move_in_date,
          pjr.created_at,
          pjr.updated_at,
          pjr.property_ad_id,
          pjr.tenant_id,
          p.name as property_name,
          p.id as property_id,
          o.id as owner_id,
          u.full_name as owner_name,
          u.email as owner_email,
          u.phone_no as owner_phone,
          t.id as tenant_id,
          tu.full_name as tenant_name,
          tu.email as tenant_email,
          tu.phone_no as tenant_phone
        FROM property_join_requests pjr
        JOIN property_ads pa ON pjr.property_ad_id = pa.id
        JOIN properties p ON pa.property_id = p.id
        JOIN owners o ON p.owner_id = o.id
        JOIN users u ON o.user_id = u.id
        JOIN tenants t ON pjr.tenant_id = t.id
        JOIN users tu ON t.user_id = tu.id
        WHERE o.user_id = ?
        ORDER BY pjr.created_at DESC
      `, {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      });

      // Transform the raw results into the expected format
      const requests = results.map(row => ({
        id: row.id,
        status: row.status,
        move_in_date: row.move_in_date,
        created_at: row.created_at,
        updated_at: row.updated_at,
        property_ad_id: row.property_ad_id,
        tenant_id: row.tenant_id,
        propertyAd: {
          id: row.property_ad_id,
          property: {
            id: row.property_id,
            name: row.property_name,
            propertyOwner: {
              id: row.owner_id,
              ownerUser: {
                id: userId,
                full_name: row.owner_name,
                email: row.owner_email,
                phone_no: row.owner_phone
              }
            }
          }
        },
        tenant: {
          id: row.tenant_id,
          tenantUser: {
            id: row.tenant_id,
            full_name: row.tenant_name,
            email: row.tenant_email,
            phone_no: row.tenant_phone
          }
        }
      }));

      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Respond to a join request (approve/reject)
   * @param {number} requestId - Request ID
   * @param {string} status - 'approved' or 'rejected'
   * @param {number} userId - Owner's user ID
   * @returns {Object} Updated request
   */
  async respondToJoinRequest(requestId, status, userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const joinRequest = await PropertyJoinRequest.findByPk(requestId, {
        include: [{
          model: PropertyAd,
          as: 'propertyAd',
          include: [{
            model: Property,
            as: 'property'
          }]
        }]
      });

      if (!joinRequest) {
        throw new Error('Join request not found');
      }

      // Verify user is the property owner or admin
      if (user.role !== 'admin') {
        const owner = await Owner.findOne({ where: { user_id: userId } });
        if (!owner || joinRequest.propertyAd.property.owner_id !== owner.id) {
          throw new Error('Only the property owner or admin can respond to join requests');
        }
      }

      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Status must be approved or rejected');
      }

      await joinRequest.update({
        status
      });

      // If approved, set the tenant's property_id
      if (status === 'approved') {
        const tenant = await Tenant.findByPk(joinRequest.tenant_id);
        if (tenant) {
          await tenant.update({
            property_id: joinRequest.propertyAd.property.id
          });
        }
      }

      return await this.getJoinRequestById(requestId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a join request
   * @param {number} requestId - Request ID
   * @param {number} userId - User ID (tenant or owner)
   * @returns {boolean} Success status
   */
  async deleteJoinRequest(requestId, userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const joinRequest = await PropertyJoinRequest.findByPk(requestId, {
        include: [
          {
            model: PropertyAd,
            as: 'propertyAd',
            include: [{
              model: Property,
              as: 'property'
            }]
          },
          {
            model: Tenant,
            as: 'tenant'
          }
        ]
      });

      if (!joinRequest) {
        throw new Error('Join request not found');
      }

      // Verify user can delete the request
      if (user.role !== 'admin') {
        if (user.role === 'tenant') {
          // Tenant can only delete their own requests
          if (joinRequest.tenant.user_id !== userId) {
            throw new Error('You can only delete your own join requests');
          }
        } else if (user.role === 'owner') {
          // Owner can only delete requests for their properties
          const owner = await Owner.findOne({ where: { user_id: userId } });
          if (!owner || joinRequest.propertyAd.property.owner_id !== owner.id) {
            throw new Error('You can only delete join requests for your properties');
          }
        }
      }

      await joinRequest.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PropertyJoinRequestService();
