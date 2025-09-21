"""
Modèles pour la gestion des cours EcosystIA
Compatible avec les types TypeScript du frontend
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Course(models.Model):
    """
    Modèle de cours principal
    Compatible avec l'interface Course du frontend
    """
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Débutant'),
        ('Intermediate', 'Intermédiaire'),
        ('Advanced', 'Avancé'),
        ('Expert', 'Expert'),
    ]
    
    STATUS_CHOICES = [
        ('Draft', 'Brouillon'),
        ('Published', 'Publié'),
        ('Archived', 'Archivé'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taught_courses')
    duration = models.CharField(max_length=50, help_text="Durée estimée du cours")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Métadonnées
    icon = models.CharField(max_length=100, default='fas fa-book')
    thumbnail = models.URLField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    prerequisites = models.TextField(blank=True, null=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    # Statistiques
    enrollment_count = models.PositiveIntegerField(default=0)
    completion_rate = models.FloatField(default=0.0)
    rating = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'courses_course'
        verbose_name = 'Cours'
        verbose_name_plural = 'Cours'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['instructor']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def modules(self):
        """Retourne les modules du cours"""
        return self.module_set.all()
    
    @property
    def enrolled_users(self):
        """Retourne les utilisateurs inscrits"""
        return User.objects.filter(courseenrollment__course=self)


class Module(models.Model):
    """
    Modèle de module de cours
    Compatible avec l'interface Module du frontend
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses_module'
        verbose_name = 'Module'
        verbose_name_plural = 'Modules'
        ordering = ['order']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"
    
    @property
    def lessons(self):
        """Retourne les leçons du module"""
        return self.lesson_set.all()


class Lesson(models.Model):
    """
    Modèle de leçon
    Compatible avec l'interface Lesson du frontend
    """
    TYPE_CHOICES = [
        ('video', 'Vidéo'),
        ('reading', 'Lecture'),
        ('quiz', 'Quiz'),
        ('assignment', 'Devoir'),
        ('discussion', 'Discussion'),
    ]
    
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    duration = models.CharField(max_length=20, help_text="Durée estimée en minutes")
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    
    # Contenu
    content = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    resources = models.JSONField(default=list, blank=True)
    
    # Métadonnées
    icon = models.CharField(max_length=100, default='fas fa-play-circle')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses_lesson'
        verbose_name = 'Leçon'
        verbose_name_plural = 'Leçons'
        ordering = ['order']
        indexes = [
            models.Index(fields=['module', 'order']),
            models.Index(fields=['type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.module.title}"


class CourseEnrollment(models.Model):
    """
    Modèle d'inscription à un cours
    """
    STATUS_CHOICES = [
        ('Enrolled', 'Inscrit'),
        ('In Progress', 'En Cours'),
        ('Completed', 'Terminé'),
        ('Dropped', 'Abandonné'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Enrolled')
    
    # Progression
    progress = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    completed_lessons = models.ManyToManyField(Lesson, blank=True, related_name='completed_by')
    
    # Dates
    enrolled_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    # Évaluation
    rating = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'courses_courseenrollment'
        verbose_name = 'Inscription au Cours'
        verbose_name_plural = 'Inscriptions aux Cours'
        unique_together = ['user', 'course']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['course', 'status']),
            models.Index(fields=['enrolled_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.course.title}"
    
    def update_progress(self):
        """Met à jour le progrès basé sur les leçons complétées"""
        total_lessons = self.course.lessons.count()
        if total_lessons > 0:
            completed_count = self.completed_lessons.count()
            self.progress = int((completed_count / total_lessons) * 100)
            
            if self.progress == 100 and self.status != 'Completed':
                self.status = 'Completed'
                self.completed_at = timezone.now()
            
            self.save()


class CourseFile(models.Model):
    """
    Modèle pour les fichiers de cours
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='courses/files/')
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'courses_coursefile'
        verbose_name = 'Fichier de Cours'
        verbose_name_plural = 'Fichiers de Cours'
    
    def __str__(self):
        return f"{self.name} - {self.course.title}"