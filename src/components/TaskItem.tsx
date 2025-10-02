import { useState } from 'react';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import type { Task } from '../domain/entities/Task';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: { title?: string; description?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

export function TaskItem({ task, onUpdate, onDelete, onToggleStatus }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const handleSave = async () => {
    await onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await onDelete(task.id);
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
      task.status === 'completed' ? 'opacity-75' : ''
    }`}>
      <CardContent className="p-0">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={() => onToggleStatus(task.id)}
            className="mt-1"
          />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título da tarefa"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição da tarefa"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Salvar
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className={`font-semibold leading-tight text-foreground ${
                task.status === 'completed' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm text-muted-foreground ${
                  task.status === 'completed' ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {task.createdAt.toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

          {!isEditing && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
