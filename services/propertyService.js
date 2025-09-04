const Property = require('../models/Property');
const Owner = require('../models/Owner');
const User = require('../models/User');
const sequelize = require('../configs/database');

class PropertyService {
  /**
   * Create a new property
   * @param {Object} propertyData - Property data
   * @param {number} ownerId - Owner's user ID
   * @returns {Object} Created property
   */
  async createProperty(propertyData, userId) {
    try {
      // Verify user exists and has owner role
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role !== 'owner' && user.role !== 'admin') {
        throw new Error('Only owners can create properties');
      }

      // Get or create owner record
      let owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        owner = await Owner.create({ user_id: userId });
      }

      const property = await Property.create({
        ...propertyData,
        owner_id: owner.id
      });

      return await this.getPropertyById(property.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all properties with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of properties
   */
  async getAllProperties(filters = {}) {
    try {
      const whereClause = {};
      
      // Apply filters
      if (filters.owner_id) {
        whereClause.owner_id = filters.owner_id;
      }
      
      if (filters.space_available !== undefined) {
        whereClause.space_available = filters.space_available;
      }

      const properties = await Property.findAll({
        where: whereClause,
        include: [{
          model: Owner,
          as: 'propertyOwner',
          include: [{
            model: User,
            as: 'ownerUser',
            attributes: ['id', 'full_name', 'email', 'phone_no']
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      return properties;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property by ID with owner details
   * @param {number} propertyId - Property ID
   * @returns {Object} Property with owner details
   */
  async getPropertyById(propertyId) {
    try {
      const property = await Property.findByPk(propertyId, {
        include: [{
          model: Owner,
          as: 'propertyOwner',
          include: [{
            model: User,
            as: 'ownerUser',
            attributes: ['id', 'full_name', 'email', 'phone_no']
          }]
        }]
      });

      if (!property) {
        throw new Error('Property not found');
      }

      return property;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update property
   * @param {number} propertyId - Property ID
   * @param {Object} updateData - Data to update
   * @param {number} userId - User ID (for authorization)
   * @returns {Object} Updated property
   */
  async updateProperty(propertyId, updateData, userId) {
    try {
      const property = await Property.findByPk(propertyId);
      
      if (!property) {
        throw new Error('Property not found');
      }

      // Check if user is the owner or admin
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get owner record for the user
      const owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        throw new Error('Owner record not found');
      }

      if (property.owner_id !== owner.id && user.role !== 'admin') {
        throw new Error('Only the property owner or admin can update this property');
      }

      await property.update(updateData);
      
      return await this.getPropertyById(propertyId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete property
   * @param {number} propertyId - Property ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} Success status
   */
  async deleteProperty(propertyId, userId) {
    try {
      const property = await Property.findByPk(propertyId);
      
      if (!property) {
        throw new Error('Property not found');
      }

      // Check if user is the owner or admin
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get owner record for the user
      const owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        throw new Error('Owner record not found');
      }

      if (property.owner_id !== owner.id && user.role !== 'admin') {
        throw new Error('Only the property owner or admin can delete this property');
      }

      await property.destroy();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get properties by owner ID
   * @param {number} userId - Owner's user ID
   * @returns {Array} Array of properties owned by the user
   */
  async getPropertiesByOwner(userId) {
    try {
      // Get owner record for the user
      const owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        throw new Error('Owner record not found');
      }

      const properties = await Property.findAll({
        where: { owner_id: owner.id },
        include: [{
          model: Owner,
          as: 'propertyOwner',
          include: [{
            model: User,
            as: 'ownerUser',
            attributes: ['id', 'full_name', 'email', 'phone_no']
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      return properties;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get properties near a specific location
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in kilometers (default: 10)
   * @returns {Array} Array of properties near the location
   */
  async getPropertiesNearLocation(location, radius = 10) {
    try {
      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        throw new Error('Valid location coordinates are required');
      }

      // For now, return all properties with coordinates
      // In a real implementation, you would use a spatial query
      const properties = await Property.findAll({
        where: {
          coordinates: {
            [sequelize.Op.ne]: null
          }
        },
        include: [{
          model: Owner,
          as: 'propertyOwner',
          include: [{
            model: User,
            as: 'ownerUser',
            attributes: ['id', 'full_name', 'email', 'phone_no']
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      // Filter properties within radius (simplified calculation)
      const filteredProperties = properties.filter(property => {
        if (!property.coordinates) return false;
        
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          property.coordinates.latitude,
          property.coordinates.longitude
        );
        
        return distance <= radius;
      });

      return filteredProperties;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

module.exports = new PropertyService();
