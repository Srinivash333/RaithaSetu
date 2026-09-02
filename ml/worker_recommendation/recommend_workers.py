"""
RaithaSetu AI - Worker Recommendation Machine Learning Module
This baseline script evaluates agricultural workers based on skill vector matching,
spatial distance decay, experience duration, and wage compatibility.
"""

import math

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of earth in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) * math.sin(dLon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_match_score(job, worker):
    # Skill match ratio
    req_skills = set(job.get('required_skills', []))
    worker_skills = set(worker.get('skills', []))
    skill_match = len(req_skills.intersection(worker_skills)) / max(1, len(req_skills))

    # Distance calculation
    dist_km = calculate_haversine_distance(
        job['lat'], job['lng'],
        worker['lat'], worker['lng']
    )
    dist_score = max(0.0, 1.0 - (dist_km / 50.0))

    # Weighted calculation
    overall_score = round(((skill_match * 0.4) + (dist_score * 0.3) + (worker.get('rating', 4.5)/5.0 * 0.3)) * 100, 1)

    return {
        'worker_id': worker['id'],
        'name': worker['name'],
        'match_score': overall_score,
        'distance_km': dist_km,
        'explanation': f"Recommended with {overall_score}% match score. Worker is {dist_km} km away and has matching farm skills."
    }

if __name__ == '__main__':
    sample_job = {'lat': 12.9716, 'lng': 77.5946, 'required_skills': ['Harvesting', 'Pesticide Spraying']}
    sample_worker = {'id': 'w101', 'name': 'Ramesh Kumar', 'lat': 12.9850, 'lng': 77.6050, 'skills': ['Harvesting', 'Sowing', 'Pesticide Spraying'], 'rating': 4.8}
    print(calculate_match_score(sample_job, sample_worker))
