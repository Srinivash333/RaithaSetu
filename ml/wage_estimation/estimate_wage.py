"""
RaithaSetu AI - Baseline Agricultural Wage Estimation Module
Calculates fair market wages based on crop complexity, regional benchmarks, and labor demand.
"""

def predict_wage(crop, work_type, location="Karnataka"):
    base_wage = 600
    crop_multipliers = {
        'Tomato': 1.1,
        'Paddy': 1.0,
        'Sugarcane': 1.2,
        'Cotton': 1.15,
        'Arecanut': 1.25
    }
    
    work_multipliers = {
        'Harvesting': 1.2,
        'Pesticide Spraying': 1.3,
        'Sowing': 1.05,
        'Tilling': 1.15,
        'Weeding': 0.95
    }

    c_mult = crop_multipliers.get(crop, 1.0)
    w_mult = work_multipliers.get(work_type, 1.0)

    suggested = int(base_wage * c_mult * w_mult)
    min_wage = int(suggested * 0.9)
    max_wage = int(suggested * 1.15)

    return {
        'crop': crop,
        'work_type': work_type,
        'location': location,
        'estimated_wage_range': f"₹{min_wage} - ₹{max_wage} / day",
        'suggested_wage': f"₹{suggested} / day"
    }

if __name__ == '__main__':
    print(predict_wage('Tomato', 'Harvesting', 'Mandya'))
