const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Detection = sequelize.define('Detection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  original_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  image_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plant_type: {
    type: DataTypes.ENUM(
      'tomato', 'potato', 'corn', 'rice', 'wheat', 'soybean', 
      'apple', 'grape', 'citrus', 'strawberry', 'pepper', 'other'
    ),
    allowNull: false
  },
  disease: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    validate: {
      min: 0,
      max: 1
    }
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.JSON,
    allowNull: true
  },
  causes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  treatments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  prevention: {
    type: DataTypes.JSON,
    allowNull: true
  },
  location_coordinates: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  location_address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  location_country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location_region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  weather_temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  weather_humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  weather_conditions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Notes cannot exceed 500 characters'
      }
    }
  },
  processing_time: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  model_version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0'
  },
  status: {
    type: DataTypes.ENUM('processing', 'completed', 'failed'),
    defaultValue: 'completed'
  }
}, {
  tableName: 'detections',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['plant_type']
    },
    {
      fields: ['disease']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_public']
    }
  ]
});

Detection.associate = (models) => {
  Detection.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

Detection.prototype.getLocationCoordinates = function() {
  if (this.location_coordinates) {
    return [this.location_coordinates.coordinates[0], this.location_coordinates.coordinates[1]];
  }
  return null;
};

Detection.prototype.setLocationCoordinates = function(longitude, latitude) {
  this.location_coordinates = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
};

Detection.findByPlantType = function(plantType) {
  return this.findAll({ where: { plant_type: plantType } });
};

Detection.findByDisease = function(disease) {
  return this.findAll({ where: { disease } });
};

Detection.findPublicDetections = function() {
  return this.findAll({ 
    where: { is_public: true },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'name']
    }]
  });
};

Detection.getDetectionStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'plant_type',
      'disease',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['plant_type', 'disease'],
    raw: true
  });
  return stats;
};

module.exports = Detection;