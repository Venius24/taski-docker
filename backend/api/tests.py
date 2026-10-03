from http import HTTPStatus

from api import models
from django.test import Client, TestCase


class TaskiAPITestCase(TestCase):
    def setUp(self):
        self.guest_client = Client()

    def test_list_exists(self):
        """Проверка доступности списка задач."""
        response = self.guest_client.get('/api/tasks/')
        self.assertEqual(response.status_code, HTTPStatus.OK)

    def test_task_creation(self):
        """Проверка создания задачи."""
        data = {'title': 'Test', 'description': 'Test'}
        response = self.guest_client.post('/api/tasks/', data=data)
        self.assertEqual(response.status_code, HTTPStatus.CREATED)
        self.assertTrue(models.Task.objects.filter(title='Test').exists())

    def test_task_string_is_its_title(self):
        task = models.Task(title='Write tests', description='Check model')
        self.assertEqual(str(task), 'Write tests')

    def test_delete_returns_no_content(self):
        task = models.Task.objects.create(title='Remove', description='After reading')
        response = self.guest_client.delete(f'/api/tasks/{task.id}/')
        self.assertEqual(response.status_code, HTTPStatus.NO_CONTENT)
        self.assertFalse(models.Task.objects.filter(pk=task.pk).exists())
