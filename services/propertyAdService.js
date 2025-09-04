const PropertyAd = require('../models/PropertyAd');
const Property = require('../models/Property');
const Owner = require('../models/Owner');
const User = require('../models/User');

class PropertyAdService {
  /**
   * Create a new property ad
   * @param {Object} adData - Property ad data
   * @param {number} userId - Owner's user ID
   * @returns {Object} Created property ad
   */
  async createPropertyAd(adData, userId) {
    try {
      // Verify user exists and has owner role
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role !== 'owner' && user.role !== 'admin') {
        throw new Error('Only owners can create property ads');
      }

      // Get owner record for the user
      const owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        throw new Error('Owner record not found');
      }

      // Verify property exists and belongs to the owner
      const property = await Property.findByPk(adData.property_id);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.owner_id !== owner.id && user.role !== 'admin') {
        throw new Error('You can only create ads for your own properties');
      }

      // Verify number_of_spaces_looking_for doesn't exceed property's space_available
      if (adData.number_of_spaces_looking_for > property.space_available) {
        throw new Error('Number of spaces looking for cannot exceed available space in property');
      }

      const propertyAd = await PropertyAd.create(adData);

      return await this.getPropertyAdById(propertyAd.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all property ads with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of property ads
   */
  async getAllPropertyAds(filters = {}) {
    try {
      const whereClause = {};
      
      // Apply filters
      if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
      }

      const propertyAds = await PropertyAd.findAll({
        where: whereClause,
        include: [{
          model: Property,
          as: 'property',
          include: [{
            model: Owner,
            as: 'propertyOwner',
            include: [{
              model: User,
              as: 'ownerUser',
              attributes: ['id', 'full_name', 'email', 'phone_no']
            }]
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      return propertyAds;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property ad by ID
   * @param {number} adId - Property ad ID
   * @returns {Object} Property ad with details
   */
  async getPropertyAdById(adId) {
    try {
      const propertyAd = await PropertyAd.findByPk(adId, {
        include: [{
          model: Property,
          as: 'property',
          include: [{
            model: Owner,
            as: 'propertyOwner',
            include: [{
              model: User,
              as: 'ownerUser',
              attributes: ['id', 'full_name', 'email', 'phone_no']
            }]
          }]
        }]
      });

      if (!propertyAd) {
        throw new Error('Property ad not found');
      }

      return propertyAd;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update property ad
   * @param {number} adId - Property ad ID
   * @param {Object} updateData - Data to update
   * @param {number} userId - User ID (for authorization)
   * @returns {Object} Updated property ad
   */
  async updatePropertyAd(adId, updateData, userId) {
    try {
      const propertyAd = await PropertyAd.findByPk(adId, {
        include: [{
          model: Property,
          as: 'property'
        }]
      });
      
      if (!propertyAd) {
        throw new Error('Property ad not found');
      }

      // Check if user is the owner or admin
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin') {
        const owner = await Owner.findOne({ where: { user_id: userId } });
        if (!owner || propertyAd.property.owner_id !== owner.id) {
          throw new Error('Only the property owner or admin can update this ad');
        }
      }

      // If updating number_of_spaces_looking_for, validate against property's space_available
      if (updateData.number_of_spaces_looking_for && 
          updateData.number_of_spaces_looking_for > propertyAd.property.space_available) {
        throw new Error('Number of spaces looking for cannot exceed available space in property');
      }

      await propertyAd.update(updateData);
      
      return await this.getPropertyAdById(adId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete property ad
   * @param {number} adId - Property ad ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} Success status
   */
  async deletePropertyAd(adId, userId) {
    try {
      const propertyAd = await PropertyAd.findByPk(adId, {
        include: [{
          model: Property,
          as: 'property'
        }]
      });
      
      if (!propertyAd) {
        throw new Error('Property ad not found');
      }

      // Check if user is the owner or admin
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin') {
        const owner = await Owner.findOne({ where: { user_id: userId } });
        if (!owner || propertyAd.property.owner_id !== owner.id) {
          throw new Error('Only the property owner or admin can delete this ad');
        }
      }

      await propertyAd.destroy();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get property ads by owner
   * @param {number} userId - Owner's user ID
   * @returns {Array} Array of property ads owned by the user
   */
  async getPropertyAdsByOwner(userId) {
    try {
      // Get owner record for the user
      const owner = await Owner.findOne({ where: { user_id: userId } });
      if (!owner) {
        throw new Error('Owner record not found');
      }

      const propertyAds = await PropertyAd.findAll({
        include: [{
          model: Property,
          as: 'property',
          where: { owner_id: owner.id },
          include: [{
            model: Owner,
            as: 'propertyOwner',
            include: [{
              model: User,
              as: 'ownerUser',
              attributes: ['id', 'full_name', 'email', 'phone_no']
            }]
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      return propertyAds;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active property ads near a location
   * @param {Object} location - Location coordinates
   * @param {number} radius - Search radius in kilometers (default: 10)
   * @returns {Array} Array of active property ads near the location
   */
  async getPropertyAdsNearLocation(location, radius = 10) {
    try {
      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        throw new Error('Valid location coordinates are required');
      }

      // Get all active property ads with properties that have coordinates
      const propertyAds = await PropertyAd.findAll({
        where: {
          is_active: true
        },
        include: [{
          model: Property,
          as: 'property',
          where: {
            coordinates: {
              [require('sequelize').Op.ne]: null
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
          }]
        }],
        order: [['createdAt', 'DESC']]
      });

      // Filter property ads within radius
      const filteredPropertyAds = propertyAds.filter(ad => {
        if (!ad.property.coordinates) return false;
        
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          ad.property.coordinates.latitude,
          ad.property.coordinates.longitude
        );
        
        return distance <= radius;
      });

      return filteredPropertyAds;
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

module.exports = new PropertyAdService();
