'use client';

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  FileText,
  Lock,
  Unlock,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { type CompetitionRow } from "@/queries/competitions";
import { 
  toggleCompetitionStatusAction,
  deleteCompetitionAction,
  updateCompetitionOrderAction
} from "@/actions/competitions";
import EditCompetitionDialog from "./EditCompetitionDialog";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

interface CompetitionsListProps {
  competitions: CompetitionRow[];
  eventId: string;
}

export const tiptapExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  CodeBlockLowlight.configure({
    lowlight: createLowlight(common),
  }),
  Color.configure({ types: ["textStyle"] }),
  TextStyle,
  Image,
  Typography,
  HorizontalRule,
];

function formatRichTextToPlainText(richText: any): string {
  if (!richText) return "No description";
  
  try {
    if (typeof richText === 'string') {
      return richText;
    }
    
    if (typeof richText === 'object' && richText.type === 'doc') {
      let text = '';
      
      function extractText(node: any): void {
        if (node.type === 'text') {
          text += node.text;
        } else if (node.content) {
          node.content.forEach(extractText);
        }
      }
      
      richText.content?.forEach(extractText);
      return text || "No description";
    }
    
    return JSON.stringify(richText);
  } catch {
    return "No description";
  }
}

function SortableCompetitionCard({
  competition,
  onToggleStatus,
  onEdit,
  onDelete,
  isPending,
  isDragMode,
}: {
  competition: CompetitionRow;
  onToggleStatus: (competitionId: string, isPublished: boolean) => void;
  onEdit: (competition: CompetitionRow) => void;
  onDelete: (competitionId: string) => void;
  isPending: boolean;
  isDragMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: competition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="default" className="bg-green-500">
        Published
      </Badge>
    ) : (
      <Badge variant="secondary">Unpublished</Badge>
    );
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`p-4 ${isDragMode ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between">
        {/* Drag Handle */}
        {isDragMode && (
          <div 
            {...attributes} 
            {...listeners}
            className="mr-3 mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 space-y-3">
          {/* Competition Info */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{competition.title}</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(competition.is_published)}
              {competition.fee > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {competition.fee}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {competition.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              {/* <p className="text-sm text-muted-foreground line-clamp-2">
                {formatRichTextToPlainText(competition.description)}
              </p> */}
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    typeof competition.description === "object" && competition.description !== null && "type" in competition.description
                      ? generateHTML(competition.description as any, tiptapExtensions)
                      : ""
                }}
              />
            </div>
          )}

          {/* Publish Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={competition.is_published}
              onCheckedChange={(checked) => onToggleStatus(competition.id, checked)}
              disabled={isPending || isDragMode}
            />
            <span className="text-sm text-muted-foreground">
              {competition.is_published ? "Published" : "Unpublished"}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        {!isDragMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isPending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(competition)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Competition
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(competition.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Competition
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
}

function CompetitionCard({
  competition,
  onToggleStatus,
  onEdit,
  onDelete,
  isPending,
}: {
  competition: CompetitionRow;
  onToggleStatus: (competitionId: string, isPublished: boolean) => void;
  onEdit: (competition: CompetitionRow) => void;
  onDelete: (competitionId: string) => void;
  isPending: boolean;
}) {
  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="default" className="bg-green-500">
        Published
      </Badge>
    ) : (
      <Badge variant="secondary">Unpublished</Badge>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Competition Info */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{competition.title}</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(competition.is_published)}
              {competition.fee > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {competition.fee}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {competition.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground line-clamp-2">
                {formatRichTextToPlainText(competition.description)}
              </p>
            </div>
          )}

          {/* Publish Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={competition.is_published}
              onCheckedChange={(checked) => onToggleStatus(competition.id, checked)}
              disabled={isPending}
            />
            <span className="text-sm text-muted-foreground">
              {competition.is_published ? "Published" : "Unpublished"}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(competition)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Competition
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(competition.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Competition
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export default function CompetitionsList({ 
  competitions, 
  eventId 
}: CompetitionsListProps) {
  const [isPending, startTransition] = useTransition();
  const [editingCompetition, setEditingCompetition] = useState<CompetitionRow | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [orderedCompetitions, setOrderedCompetitions] = useState(
    competitions.sort((a, b) => a.display_order - b.display_order)
  );
  const router = useRouter();

  // Update ordered competitions when props change
  useEffect(() => {
    setOrderedCompetitions(competitions.sort((a, b) => a.display_order - b.display_order));
  }, [competitions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedCompetitions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    startTransition(async () => {
      // Create new display order based on current array position
      const updates = orderedCompetitions.map((competition, index) => ({
        id: competition.id,
        display_order: index + 1,
      }));

      const result = await updateCompetitionOrderAction(updates, eventId);

      if (result.success) {
        toast.success("Competition order updated successfully");
        setIsDragMode(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update competition order");
      }
    });
  };

  const handleCancelReorder = () => {
    // Reset to original order
    setOrderedCompetitions(competitions.sort((a, b) => a.display_order - b.display_order));
    setIsDragMode(false);
  };

  const handleToggleStatus = (competitionId: string, isPublished: boolean) => {
    startTransition(async () => {
      const result = await toggleCompetitionStatusAction(
        competitionId,
        isPublished,
        eventId
      );

      if (result.success) {
        toast.success(result.message || "Status updated successfully");
        // Refresh router to refetch server data
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleDelete = (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCompetitionAction(competitionId, eventId);

      if (result.success) {
        toast.success(result.message || "Competition deleted successfully");
        // Refresh router to refetch server data
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete competition");
      }
    });
  };

  if (competitions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No competitions yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Add your first competition to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Reorder Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {competitions.length} competition{competitions.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isDragMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDragMode(true)}
              disabled={isPending || competitions.length < 2}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Reorder
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelReorder}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveOrder}
                disabled={isPending}
              >
                <Lock className="mr-2 h-4 w-4" />
                Save Order
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Competition List */}
      {isDragMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedCompetitions} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {orderedCompetitions.map((competition) => (
                <SortableCompetitionCard
                  key={competition.id}
                  competition={competition}
                  onToggleStatus={handleToggleStatus}
                  onEdit={setEditingCompetition}
                  onDelete={handleDelete}
                  isPending={isPending}
                  isDragMode={isDragMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {orderedCompetitions.map((competition) => (
            <SortableCompetitionCard
              key={competition.id}
              competition={competition}
              onToggleStatus={handleToggleStatus}
              onEdit={setEditingCompetition}
              onDelete={handleDelete}
              isPending={isPending}
              isDragMode={isDragMode}
            />
          ))}
        </div>
      )}

      {/* Edit Competition Dialog */}
      <EditCompetitionDialog
        competition={editingCompetition}
        open={!!editingCompetition}
        onOpenChange={(open: boolean) => !open && setEditingCompetition(null)}
      />
    </>
  );
}
