from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, ClassViewSet, FeePaymentViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'fee-payments', FeePaymentViewSet)

urlpatterns = router.urls