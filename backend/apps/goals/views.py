"""
Vues pour la gestion des objectifs OKR
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F, Case, When
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Goal, KeyResult, GoalUpdate, GoalTemplate, GoalMilestone, OKRCycle
from .serializers import (
    GoalListSerializer,
    GoalDetailSerializer,
    GoalCreateUpdateSerializer,
    KeyResultSerializer,
    GoalUpdateSerializer,
    GoalTemplateSerializer,
    GoalMilestoneSerializer,
    OKRCycleSerializer,
    GoalStatsSerializer,
    OKRDashboardSerializer,
    GoalProgressUpdateSerializer,
    KeyResultProgressUpdateSerializer,
    CreateGoalFromTemplateSerializer
)
from .filters import GoalFilter, KeyResultFilter, OKRCycleFilter


class GoalListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des objectifs
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = GoalFilter
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'target_date', 'priority', 'progress']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Objectifs possédés ou assignés à l'utilisateur
        return Goal.objects.filter(
            Q(owner=self.request.user) |
            Q(assignees=self.request.user)
        ).distinct().select_related('owner', 'parent_goal', 'project').prefetch_related(
            'assignees', 'key_results', 'milestones'
        )
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GoalCreateUpdateSerializer
        return GoalListSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un objectif
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(
            Q(owner=self.request.user) |
            Q(assignees=self.request.user)
        ).distinct().select_related('owner', 'parent_goal', 'project').prefetch_related(
            'assignees', 'key_results__assignee', 'milestones', 'updates__created_by', 'sub_goals'
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return GoalCreateUpdateSerializer
        return GoalDetailSerializer


class GoalProgressView(APIView):
    """
    Vue pour mettre à jour la progression d'un objectif
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, goal_id):
        try:
            goal = Goal.objects.get(
                id=goal_id,
                owner=request.user
            )
        except Goal.DoesNotExist:
            return Response(
                {'error': 'Objectif introuvable ou accès refusé.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = GoalProgressUpdateSerializer(
            data=request.data,
            context={'goal': goal}
        )
        serializer.is_valid(raise_exception=True)
        
        old_progress = goal.progress
        new_progress = serializer.validated_data['progress']
        comment = serializer.validated_data.get('comment', '')
        
        # Mettre à jour la progression
        goal.progress = new_progress
        
        # Marquer comme terminé si 100%
        if new_progress >= 100 and goal.status == 'Active':
            goal.status = 'Completed'
            goal.completed_date = timezone.now().date()
        
        goal.save()
        
        # Créer une mise à jour
        GoalUpdate.objects.create(
            goal=goal,
            update_type='Progress',
            title=f'Progression mise à jour: {old_progress}% → {new_progress}%',
            description=comment or f'Progression mise à jour de {old_progress}% à {new_progress}%',
            old_value=old_progress,
            new_value=new_progress,
            created_by=request.user
        )
        
        return Response({
            'message': 'Progression mise à jour avec succès.',
            'old_progress': old_progress,
            'new_progress': new_progress,
            'status': goal.status
        })


class KeyResultListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des résultats clés
    """
    serializer_class = KeyResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = KeyResultFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'target_date', 'progress']
    ordering = ['-created_at']
    
    def get_queryset(self):
        goal_id = self.kwargs.get('goal_id')
        return KeyResult.objects.filter(
            goal_id=goal_id,
            goal__owner=self.request.user
        ).select_related('created_by', 'assignee', 'goal')
    
    def perform_create(self, serializer):
        goal_id = self.kwargs.get('goal_id')
        try:
            goal = Goal.objects.get(id=goal_id, owner=self.request.user)
        except Goal.DoesNotExist:
            raise PermissionDenied("Accès refusé à cet objectif.")
        
        serializer.save(goal=goal, created_by=self.request.user)


class KeyResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un résultat clé
    """
    serializer_class = KeyResultSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return KeyResult.objects.filter(
            goal__owner=self.request.user
        ).select_related('created_by', 'assignee', 'goal')


class KeyResultProgressView(APIView):
    """
    Vue pour mettre à jour la progression d'un résultat clé
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, key_result_id):
        try:
            key_result = KeyResult.objects.get(
                id=key_result_id,
                goal__owner=request.user
            )
        except KeyResult.DoesNotExist:
            return Response(
                {'error': 'Résultat clé introuvable ou accès refusé.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = KeyResultProgressUpdateSerializer(
            data=request.data,
            context={'key_result': key_result}
        )
        serializer.is_valid(raise_exception=True)
        
        old_value = key_result.current_value
        new_value = serializer.validated_data['current_value']
        comment = serializer.validated_data.get('comment', '')
        
        # Mettre à jour la progression
        key_result.update_progress(new_value)
        
        # Créer une mise à jour
        GoalUpdate.objects.create(
            goal=key_result.goal,
            key_result=key_result,
            update_type='Key Result Update',
            title=f'{key_result.title}: {old_value} → {new_value}',
            description=comment or f'Valeur mise à jour de {old_value} à {new_value}',
            old_value=old_value,
            new_value=new_value,
            created_by=request.user
        )
        
        return Response({
            'message': 'Progression mise à jour avec succès.',
            'old_value': float(old_value),
            'new_value': float(new_value),
            'completion_percentage': key_result.completion_percentage,
            'status': key_result.status
        })


class OKRCycleListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des cycles OKR
    """
    serializer_class = OKRCycleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OKRCycleFilter
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date']
    ordering = ['-start_date']
    
    def get_queryset(self):
        return OKRCycle.objects.filter(
            owner=self.request.user
        ).select_related('owner').prefetch_related('goals__owner', 'goals__assignees')
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class OKRCycleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un cycle OKR
    """
    serializer_class = OKRCycleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return OKRCycle.objects.filter(
            owner=self.request.user
        ).select_related('owner').prefetch_related('goals__owner', 'goals__assignees')


class GoalTemplateListView(generics.ListAPIView):
    """
    Vue pour lister les templates d'objectifs
    """
    serializer_class = GoalTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['created_at', 'name', 'category']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Templates publics + templates créés par l'utilisateur
        return GoalTemplate.objects.filter(
            Q(is_public=True) |
            Q(created_by=self.request.user)
        ).select_related('created_by')


class CreateGoalFromTemplateView(APIView):
    """
    Vue pour créer un objectif à partir d'un template
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateGoalFromTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        template_id = serializer.validated_data['template_id']
        title = serializer.validated_data['title']
        start_date = serializer.validated_data['start_date']
        target_date = serializer.validated_data['target_date']
        assignee_ids = serializer.validated_data.get('assignee_ids', [])
        
        try:
            template = GoalTemplate.objects.get(id=template_id)
        except GoalTemplate.DoesNotExist:
            return Response(
                {'error': 'Template introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Créer l'objectif à partir du template
        goal = template.create_goal_from_template(
            user=request.user,
            title=title,
            start_date=start_date,
            target_date=target_date
        )
        
        # Assigner les utilisateurs
        if assignee_ids:
            goal.assignees.set(assignee_ids)
        
        return Response({
            'message': 'Objectif créé avec succès à partir du template.',
            'goal': GoalDetailSerializer(goal).data
        }, status=status.HTTP_201_CREATED)


class GoalStatsView(APIView):
    """
    Vue pour les statistiques d'objectifs
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Objectifs de l'utilisateur
        user_goals = Goal.objects.filter(
            Q(owner=user) |
            Q(assignees=user)
        ).distinct()
        
        # Statistiques de base
        total_goals = user_goals.count()
        active_goals = user_goals.filter(status='Active').count()
        completed_goals = user_goals.filter(status='Completed').count()
        overdue_goals = user_goals.filter(
            target_date__lt=timezone.now().date(),
            status__in=['Active', 'Draft']
        ).count()
        
        # Résultats clés
        user_key_results = KeyResult.objects.filter(goal__in=user_goals)
        total_key_results = user_key_results.count()
        completed_key_results = user_key_results.filter(status='Completed').count()
        
        # Taux de completion moyen
        if total_goals > 0:
            average_completion_rate = sum(goal.completion_rate for goal in user_goals) / total_goals
        else:
            average_completion_rate = 0
        
        # Répartition par type
        goals_by_type = list(
            user_goals.values('type').annotate(
                count=Count('id'),
                avg_progress=Avg('progress')
            ).order_by('-count')
        )
        
        # Répartition par priorité
        goals_by_priority = list(
            user_goals.values('priority').annotate(
                count=Count('id'),
                avg_progress=Avg('progress')
            ).order_by('-count')
        )
        
        # Échéances à venir (30 prochains jours)
        upcoming_deadlines = list(
            user_goals.filter(
                target_date__lte=timezone.now().date() + timedelta(days=30),
                status='Active'
            ).values('id', 'title', 'target_date', 'progress').order_by('target_date')
        )
        
        # Terminaisons récentes (30 derniers jours)
        recent_completions = list(
            user_goals.filter(
                completed_date__gte=timezone.now().date() - timedelta(days=30),
                status='Completed'
            ).values('id', 'title', 'completed_date', 'progress').order_by('-completed_date')
        )
        
        stats = {
            'total_goals': total_goals,
            'active_goals': active_goals,
            'completed_goals': completed_goals,
            'overdue_goals': overdue_goals,
            'total_key_results': total_key_results,
            'completed_key_results': completed_key_results,
            'average_completion_rate': round(average_completion_rate, 2),
            'goals_by_type': goals_by_type,
            'goals_by_priority': goals_by_priority,
            'upcoming_deadlines': upcoming_deadlines,
            'recent_completions': recent_completions,
        }
        
        serializer = GoalStatsSerializer(stats)
        return Response(serializer.data)


class OKRDashboardView(APIView):
    """
    Vue pour le dashboard OKR complet
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Cycle OKR actuel
        current_cycle = OKRCycle.objects.filter(
            owner=user,
            start_date__lte=timezone.now().date(),
            end_date__gte=timezone.now().date()
        ).first()
        
        # Mes objectifs actifs
        my_goals = Goal.objects.filter(
            owner=user,
            status='Active'
        ).order_by('-priority', 'target_date')[:5]
        
        # Objectifs d'équipe (si manager)
        team_goals = []
        if user.role in ['manager', 'supervisor', 'administrator']:
            team_goals = Goal.objects.filter(
                type='Team',
                assignees=user
            ).distinct().order_by('-priority', 'target_date')[:5]
        
        # Mises à jour récentes
        recent_updates = GoalUpdate.objects.filter(
            goal__owner=user
        ).select_related('created_by', 'goal', 'key_result').order_by('-created_at')[:10]
        
        # Échéances à venir (7 prochains jours)
        upcoming_deadlines = Goal.objects.filter(
            Q(owner=user) | Q(assignees=user),
            target_date__lte=timezone.now().date() + timedelta(days=7),
            status='Active'
        ).distinct().order_by('target_date')[:5]
        
        # Statistiques
        stats_view = GoalStatsView()
        stats_response = stats_view.get(request)
        stats = stats_response.data
        
        dashboard_data = {
            'current_cycle': OKRCycleSerializer(current_cycle).data if current_cycle else None,
            'my_goals': GoalListSerializer(my_goals, many=True).data,
            'team_goals': GoalListSerializer(team_goals, many=True).data,
            'recent_updates': GoalUpdateSerializer(recent_updates, many=True).data,
            'upcoming_deadlines': GoalListSerializer(upcoming_deadlines, many=True).data,
            'stats': stats,
        }
        
        return Response(dashboard_data)


class MyGoalsView(generics.ListAPIView):
    """
    Vue pour lister tous mes objectifs
    """
    serializer_class = GoalListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = GoalFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'target_date', 'priority', 'progress']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Goal.objects.filter(
            owner=self.request.user
        ).select_related('owner', 'parent_goal', 'project').prefetch_related('assignees', 'key_results')


class AssignedGoalsView(generics.ListAPIView):
    """
    Vue pour lister les objectifs qui me sont assignés
    """
    serializer_class = GoalListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = GoalFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'target_date', 'priority', 'progress']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Goal.objects.filter(
            assignees=self.request.user
        ).select_related('owner', 'parent_goal', 'project').prefetch_related('assignees', 'key_results')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_goal_comment(request, goal_id):
    """
    Vue pour ajouter un commentaire à un objectif
    """
    try:
        goal = Goal.objects.get(
            id=goal_id,
            owner=request.user
        )
    except Goal.DoesNotExist:
        return Response(
            {'error': 'Objectif introuvable ou accès refusé.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    comment = request.data.get('comment', '').strip()
    if not comment:
        return Response(
            {'error': 'Le commentaire ne peut pas être vide.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Créer la mise à jour
    update = GoalUpdate.objects.create(
        goal=goal,
        update_type='Comment',
        title='Nouveau commentaire',
        description=comment,
        created_by=request.user
    )
    
    return Response({
        'message': 'Commentaire ajouté avec succès.',
        'update': GoalUpdateSerializer(update).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def goal_analytics(request):
    """
    Vue pour les analytics avancées des objectifs
    """
    user = request.user
    
    # Période d'analyse (par défaut: 12 derniers mois)
    months = int(request.GET.get('months', 12))
    
    # Progression mensuelle
    monthly_progress = []
    for i in range(months):
        month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        # Objectifs terminés ce mois
        completed_goals = Goal.objects.filter(
            owner=user,
            completed_date__range=[month_start.date(), month_end.date()]
        ).count()
        
        # Progression moyenne des objectifs actifs
        active_goals = Goal.objects.filter(
            owner=user,
            status='Active',
            created_at__lte=month_end
        )
        avg_progress = active_goals.aggregate(avg=Avg('progress'))['avg'] or 0
        
        monthly_progress.append({
            'month': month_start.strftime('%Y-%m'),
            'completed_goals': completed_goals,
            'average_progress': round(avg_progress, 2)
        })
    
    monthly_progress.reverse()
    
    # Performance par type d'objectif
    performance_by_type = []
    for goal_type, _ in Goal.TYPE_CHOICES:
        type_goals = Goal.objects.filter(owner=user, type=goal_type)
        if type_goals.exists():
            avg_completion = type_goals.aggregate(avg=Avg('progress'))['avg']
            completion_rate = type_goals.filter(status='Completed').count() / type_goals.count() * 100
            
            performance_by_type.append({
                'type': goal_type,
                'total_goals': type_goals.count(),
                'average_completion': round(avg_completion, 2),
                'completion_rate': round(completion_rate, 2)
            })
    
    return Response({
        'period_months': months,
        'monthly_progress': monthly_progress,
        'performance_by_type': performance_by_type,
        'total_goals_created': Goal.objects.filter(owner=user).count(),
        'success_rate': Goal.objects.filter(
            owner=user, 
            status='Completed'
        ).count() / Goal.objects.filter(owner=user).count() * 100 if Goal.objects.filter(owner=user).count() > 0 else 0
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_goals(request):
    """
    Vue pour mettre à jour plusieurs objectifs en masse
    """
    goal_ids = request.data.get('goal_ids', [])
    action = request.data.get('action')
    value = request.data.get('value')
    
    if not goal_ids or not action:
        return Response(
            {'error': 'IDs des objectifs et action requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier l'accès aux objectifs
    goals = Goal.objects.filter(
        id__in=goal_ids,
        owner=request.user
    )
    
    if goals.count() != len(goal_ids):
        return Response(
            {'error': 'Accès refusé à certains objectifs.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    updated_count = 0
    
    if action == 'change_status':
        if value in dict(Goal.STATUS_CHOICES):
            updated_count = goals.update(status=value)
        else:
            return Response(
                {'error': 'Statut invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif action == 'change_priority':
        if value in dict(Goal.PRIORITY_CHOICES):
            updated_count = goals.update(priority=value)
        else:
            return Response(
                {'error': 'Priorité invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif action == 'add_tag':
        if value:
            for goal in goals:
                if value not in goal.tags:
                    goal.tags.append(value)
                    goal.save()
                    updated_count += 1
    
    return Response({
        'message': f'Action "{action}" appliquée à {updated_count} objectif(s).',
        'updated_count': updated_count
    })
