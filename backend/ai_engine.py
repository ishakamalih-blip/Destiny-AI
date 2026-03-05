import cv2
import numpy as np
from PIL import Image
import io
import random

class PalmAI:
    @staticmethod
    def preprocess_image(image_bytes):
        """Preprocess the palm image for analysis."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 1. Grayscale Conversion
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Noise Removal (Gaussian Blur)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # 3. Edge Detection (Canny)
        edges = cv2.Canny(blurred, 50, 150)
        
        return img, gray, edges

    @staticmethod
    def extract_features(image_bytes):
        """Extract palm features and scores."""
        img, gray, edges = PalmAI.preprocess_image(image_bytes)
        
        # Simulate feature extraction using edge density in specific regions
        height, width = edges.shape
        
        # Divide palm into regions (biometric mapping)
        vitality_region = edges[height//2:, :width//2]
        cognitive_region = edges[height//3:height//2, :]
        emotional_region = edges[:height//3, :]
        
        # Calculate 'scores' based on edge density (biometric analysis)
        # Using a more sensitive normalization factor to capture image differences
        # Also adding a small deterministic offset based on image content to ensure uniqueness
        
        # Calculate base scores from edge density (0-255 range)
        v_density = np.mean(vitality_region)
        c_density = np.mean(cognitive_region)
        e_density = np.mean(emotional_region)
        
        # Add a "content hash" component for more variation
        content_hash = (int(np.sum(edges[:10, :10])) % 100) / 100.0
        
        # Map density to 1-10 scale with more sensitivity
        # Edge density usually peaks around 10-30 for palm lines
        # Adding more randomness to the base scores to ensure variety
        vitality_score = int((v_density * 5.0 + content_hash * 10.0 + random.random() * 20.0) % 7) + 4
        cognitive_score = int((c_density * 5.0 + content_hash * 15.0 + random.random() * 20.0) % 7) + 4
        emotional_score = int((e_density * 5.0 + content_hash * 20.0 + random.random() * 20.0) % 7) + 4
        
        # Add a larger random jitter (±2) to ensure significant category shifts
        vitality_score = min(max(vitality_score + random.randint(-2, 2), 3), 10)
        cognitive_score = min(max(cognitive_score + random.randint(-2, 2), 3), 10)
        emotional_score = min(max(emotional_score + random.randint(-2, 2), 3), 10)
        
        return {
            "vitality_index": vitality_score,
            "cognitive_index": cognitive_score,
            "emotional_index": emotional_score,
            "confidence": round(float(np.mean(edges) / 255.0 + 0.85 + (random.random() * 0.05)), 2)
        }

    @staticmethod
    def get_predictions(scores):
        """Generate predictions based on palm biometric indices with dynamic variety."""
        vs = scores['vitality_index']
        cs = scores['cognitive_index']
        es = scores['emotional_index']
        
        # Text pools for variety
        resilience_map = {
            "High": ["Exceptional resilience and stamina", "High biological durability", "Robust physical foundation"],
            "Moderate": ["Standard biological resilience", "Balanced energy distribution", "Stable physical baseline"]
        }
        
        eq_map = {
            "Superior": ["Highly attuned emotional intelligence", "Superior empathetic processing", "Advanced social awareness"],
            "Balanced": ["Standard emotional equilibrium", "Balanced interpersonal response", "Healthy social adaptability"],
            "Developing": ["Evolving emotional intelligence", "Focus on interpersonal growth", "Adaptive social learning"]
        }

        iq_map = {
            "Analytical": ["High computational logic", "Advanced pattern recognition", "Deep analytical thinking"],
            "Creative": ["Dynamic cognitive flexibility", "Lateral thinking capability", "Strong creative synthesis"],
            "Practical": ["Applied cognitive intelligence", "Operational problem solving", "Practical logical framework"]
        }

        # Select base levels
        res_level = "High" if vs > 7 else "Moderate"
        eq_level = "Superior" if es > 8 else "Balanced" if es > 5 else "Developing"
        iq_level = "Analytical" if cs > 8 else "Creative" if cs > 5 else "Practical"
        
        # Map levels to random descriptive phrases
        resilience = random.choice(resilience_map[res_level])
        eq_desc = random.choice(eq_map[eq_level])
        iq_desc = random.choice(iq_map[iq_level])
        
        # Career Mapping
        career_options = {
            "Leadership": ["Leadership & Strategic Planning", "Executive Management", "Political & Social Direction"],
            "Creative": ["Creative Arts & Design", "Media & Communication", "Innovative Architecture"],
            "Technical": ["Technical Operations", "Data Science & Research", "Engineering & Systems"]
        }
        
        c_key = "Leadership" if cs > 7 and vs > 7 else "Creative" if cs > 7 else "Technical"
        career = random.choice(career_options[c_key])

        # Relationship Mapping
        rel_options = {
            "Empathetic": ["Deeply Empathetic & Nurturing", "Emotional Connection Driven", "Harmony Oriented"],
            "Rational": ["Communicative & Rational", "Logic-Based Partnership", "Intellectual Connection"],
            "Strong": ["Independent & Strong-willed", "Goal Oriented Dynamic", "Resilient Partnership"]
        }
        r_key = "Empathetic" if es > 7 else "Rational" if cs > 7 else "Strong"
        relationship = random.choice(rel_options[r_key])

        # Humor Mapping
        humor_options = {
            "Wit": ["Sharp Wit & Satire", "Intellectual Sarcasm", "High-level Linguistic Humor"],
            "Obs": ["Observational & Contextual", "Situational Awareness", "Social Irony"],
            "Light": ["Playful & Lighthearted", "Expressive & Joyful", "Spontaneous Humor"]
        }
        h_key = "Wit" if cs > 8 else "Obs" if cs > 6 else "Light"
        humor = random.choice(humor_options[h_key])

        # Thinking Mapping
        thinking_options = {
            "Abstract": ["Abstract & Strategic", "Conceptual Architecture", "Visionary Thinking"],
            "Logical": ["Logical & Linear", "Step-by-step Analysis", "Sequential Processing"],
            "Intuitive": ["Intuitive & Pattern-based", "Holistic Perception", "Rapid Synthesis"]
        }
        t_key = "Abstract" if cs > 8 else "Logical" if cs > 6 else "Intuitive"
        thinking = random.choice(thinking_options[t_key])

        # Suggestions Pool
        all_suggestions = [
            f"Your {thinking.lower()} style is a key asset in complex environments.",
            f"In relationships, you tend to be {relationship.lower()}.",
            f"Consider a career in {career} for optimal professional growth.",
            f"Your {resilience.lower()} indicates a strong capacity for high-pressure tasks.",
            f"The {eq_desc.lower()} suggests success in collaborative ventures.",
            f"Leverage your {iq_desc.lower()} for specialized problem solving.",
            f"Your {humor.lower()} helps in maintaining social cohesion.",
            "Focus on integrating your cognitive and emotional strengths for better balance."
        ]
        
        return {
            "cognitive_profile": {
                "focus": "High" if cs > 7 else "Moderate",
                "resilience": resilience,
                "thinking_ability": thinking,
                "iq_type": iq_desc
            },
            "emotional_profile": {
                "eq_level": eq_desc,
                "stability": "Stable" if es > 6 else "Fluid",
                "relationship_dynamic": relationship,
                "sense_of_humor": humor
            },
            "behavioral_profile": {
                "type": "Proactive & Driven" if vs > 7 else "Reflective & Methodical" if cs > 7 else "Adaptable & Fluid",
                "career_guidance": career
            },
            "suggestions": random.sample(all_suggestions, 3)
        }
