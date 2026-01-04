from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
import json
import random

@api_view(['POST'])
@parser_classes([MultiPartParser])
def parse_resume(request):
    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
        
        resume_file = request.FILES['file']
        
        # Mock Parsing Logic
        mock_skills = ['Python', 'React', 'TypeScript', 'Docker', 'MongoDB', 'AWS']
        return JsonResponse({
            'name': 'John Doe (Mock)',
            'email': 'john.doe@example.com',
            'phone': '+1-555-0123',
            'skills': random.sample(mock_skills, 3),
            'experienceYears': random.randint(1, 10),
            'education': [{'degree': 'B.Sc Computer Science', 'school': 'Tech University', 'year': 2020}],
            'companies': ['Google', 'Amazon', 'Startup Inc']
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@parser_classes([JSONParser])
def generate_jd(request):
    try:
        data = request.data
        title = data.get('title', 'Software Engineer')
        skills = data.get('skills', 'General')
        
        # "AI" Generation Logic (Template-based for demo)
        overview = f"We are looking for a talented {title} to join our dynamic team. You will be responsible for building scalable solutions using {skills}."
        responsibilities = [
            f"Design and implement efficient code using {skills}.",
            "Collaborate with cross-functional teams.",
            "Participate in code reviews and architecture discussions.",
            "Troubleshoot and debug production issues."
        ]
        requirements = [
            f"Proven experience as a {title}.",
            f"Strong knowledge of {skills}.",
            "Excellent problem-solving skills.",
            "BS in Computer Science or related field."
        ]
        
        return JsonResponse({
            'overview': overview,
            'responsibilities': responsibilities,
            'requirements': requirements,
            'salary_range': '$100k - $140k'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@parser_classes([JSONParser])
def analyze_match(request):
    try:
        data = request.data
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        
        # Mock "Advanced" Analysis
        score = random.randint(60, 98)
        
        analysis = []
        if score > 80:
            analysis.append("Strong match for required skills.")
            analysis.append("Good experience level detected.")
        else:
            analysis.append("Missing some key technical keywords.")
            analysis.append("Experience duration might be lower than required.")
            
        keywords_found = ['React', 'TypeScript', 'Team Player']
        missing_keywords = ['Kubernetes', 'GraphQL']
        
        return JsonResponse({
            'score': score,
            'analysis': analysis,
            'keywords_found': keywords_found,
            'missing_keywords': missing_keywords
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
