CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    plant_type VARCHAR(100) NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    treatment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_detections_user_id ON detections(user_id);
CREATE INDEX idx_detections_created_at ON detections(created_at);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@plantdisease.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBkedtXrJNnQGW', 'admin');

INSERT INTO users (name, email, password, role) VALUES 
('Test User', 'user@test.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

INSERT INTO detections (user_id, image_path, plant_type, disease_name, confidence, treatment) VALUES 
(2, 'uploads/sample-leaf-1.jpg', 'Tomato', 'Late Blight', 0.8750, 'Apply fungicide containing chlorothalonil or mancozeb. Remove affected leaves and improve air circulation.'),
(2, 'uploads/sample-leaf-2.jpg', 'Potato', 'Early Blight', 0.9200, 'Use fungicides with active ingredients like azoxystrobin. Practice crop rotation and avoid overhead watering.'),
(2, 'uploads/sample-leaf-3.jpg', 'Apple', 'Apple Scab', 0.7800, 'Apply protective fungicides during spring. Remove fallen leaves and prune for better air circulation.');

CREATE VIEW user_detection_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(d.id) as total_detections,
    MAX(d.created_at) as last_detection
FROM users u
LEFT JOIN detections d ON u.id = d.user_id
GROUP BY u.id, u.name, u.email;

CREATE VIEW detection_summary AS
SELECT 
    plant_type,
    disease_name,
    COUNT(*) as detection_count,
    AVG(confidence) as avg_confidence,
    MAX(created_at) as last_detected
FROM detections
GROUP BY plant_type, disease_name
ORDER BY detection_count DESC;

CREATE OR REPLACE FUNCTION get_user_recent_detections(user_id_param INTEGER, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
    id INTEGER,
    image_path VARCHAR,
    plant_type VARCHAR,
    disease_name VARCHAR,
    confidence DECIMAL,
    treatment TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.image_path,
        d.plant_type,
        d.disease_name,
        d.confidence,
        d.treatment,
        d.created_at
    FROM detections d
    WHERE d.user_id = user_id_param
    ORDER BY d.created_at DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
