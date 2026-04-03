from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

class BaseModelViewSet(viewsets.ModelViewSet):
    """
    Standard ViewSet with high-level CRUD support.
    Strictly uses GET for retrieval and POST for all modifications.
    """
    permission_classes = [permissions.IsAuthenticated]

    def handle_command(self, request, pk=None):
        """
        Standard dispatcher for POST-based 'commands' on a resource instance.
        """
        cmd = request.data.get('cmd')
        if not cmd:
            return Response({'detail': 'Command (cmd) is required for POST actions.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Look for a method like 'cmd_cancel_pending'
        handler_name = f'cmd_{cmd.replace("-", "_")}'
        handler = getattr(self, handler_name, None)
        
        if not handler:
            return Response({'detail': f'Command {cmd} is not supported.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return handler(request, pk)

    def cmd_update(self, request, pk=None):
        """Standard high-level update command."""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def cmd_delete(self, request, pk=None):
        """Standard high-level delete command."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }
