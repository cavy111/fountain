from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, ClassViewSet, FeePaymentViewSet, GuardianViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'fee-payments', FeePaymentViewSet)
router.register(r'guardians', GuardianViewSet)

urlpatterns = router.urls