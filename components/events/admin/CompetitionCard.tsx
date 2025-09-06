'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  GripVertical, 
  Edit, 
  Trash2, 
  DollarSign,
  FileText
} from "lucide-react";
import { type CompetitionRow } from "@/queries/competitions";

interface CompetitionCardProps {
  competition: CompetitionRow;
  onToggleStatus: (competitionId: string, isPublished: boolean) => void;
  onEdit: (competition: CompetitionRow) => void;
  onDelete: (competitionId: string) => void;
  isPending: boolean;
}

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

export default function CompetitionCard({
  competition,
  onToggleStatus,
  onEdit,
  onDelete,
  isPending,
}: CompetitionCardProps) {
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
      className={`transition-opacity ${isDragging ? "opacity-50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Drag Handle */}
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab active:cursor-grabbing p-1 mt-1"
              {...attributes}
              {...listeners}
              disabled={isPending}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Competition Info */}
            <div className="flex-1 space-y-2">
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
      </CardHeader>
    </Card>
  );
}
