import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatNumber, initials, slugify } from '@/lib/utils';
import type { Course, Lesson, Module } from '@/types';

export function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const original = courseId ? demoStore.getCourse(courseId) : null;
  const [course, setCourse] = useState<Course | null>(original);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  if (!course) {
    return (
      <AppShell>
        <p>Course not found.</p>
        <Button asChild className="mt-4"><Link to="/instructor">Back</Link></Button>
      </AppShell>
    );
  }

  const isOwner = user && (course.instructorId === user.id || user.roles.includes('admin'));
  if (!isOwner) {
    return (
      <AppShell>
        <p className="eyebrow">Not yours</p>
        <h1 className="mt-2 font-display text-title1">You can't edit this course.</h1>
      </AppShell>
    );
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const aStr = String(active.id);
    const oStr = String(over.id);
    setCourse((c) => {
      if (!c) return c;
      // module reorder
      if (aStr.startsWith('mod:') && oStr.startsWith('mod:')) {
        const aId = aStr.slice(4);
        const oId = oStr.slice(4);
        const a = c.modules.findIndex((m) => m.id === aId);
        const o = c.modules.findIndex((m) => m.id === oId);
        const next = arrayMove(c.modules, a, o).map((m, i) => ({ ...m, order: i }));
        return { ...c, modules: next };
      }
      // lesson reorder within module
      if (aStr.startsWith('les:') && oStr.startsWith('les:')) {
        const [, aMod, aLes] = aStr.split(':');
        const [, oMod, oLes] = oStr.split(':');
        if (aMod !== oMod) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== aMod) return m;
            const a = m.lessons.findIndex((l) => l.id === aLes);
            const o = m.lessons.findIndex((l) => l.id === oLes);
            return { ...m, lessons: arrayMove(m.lessons, a, o).map((l, i) => ({ ...l, order: i })) };
          }),
        };
      }
      return c;
    });
  }

  function save() {
    if (!course) return;
    const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
    const estimatedMinutes = course.modules.reduce(
      (a, m) => a + m.lessons.reduce((s, l) => s + l.durationMinutes, 0),
      0,
    );
    const next: Course = { ...course, totalLessons, estimatedMinutes };
    demoStore.upsertCourse(next);
    setCourse(next);
    toast.success('Saved.');
  }

  function addModule() {
    setCourse((c) => {
      if (!c) return c;
      const id = `${c.id}_m${Date.now()}`;
      const m: Module = { id, courseId: c.id, title: 'New module', order: c.modules.length, lessons: [] };
      return { ...c, modules: [...c.modules, m] };
    });
  }

  function addLesson(moduleId: string, type: 'video' | 'text' | 'quiz') {
    setCourse((c) => {
      if (!c) return c;
      return {
        ...c,
        modules: c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          const id = `${m.id}_l${Date.now()}`;
          const lesson: Lesson = {
            id, courseId: c.id, moduleId,
            title: 'Untitled lesson',
            order: m.lessons.length,
            type,
            content: type === 'text' ? '## Lesson body\n\nWrite something.' : '',
            durationMinutes: 5,
            isFreePreview: false,
          };
          if (type === 'quiz') lesson.questions = [{ id: `q_${Date.now()}`, prompt: 'Sample question', options: ['One', 'Two', 'Three'], correctIndex: 0 }];
          if (type === 'video') lesson.videoUrl = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
          return { ...m, lessons: [...m.lessons, lesson] };
        }),
      };
    });
  }

  function updateMeta(patch: Partial<Course>) { setCourse((c) => (c ? { ...c, ...patch } : c)); }
  function updateModule(mid: string, patch: Partial<Module>) {
    setCourse((c) => c ? { ...c, modules: c.modules.map((m) => m.id === mid ? { ...m, ...patch } : m) } : c);
  }
  function updateLesson(mid: string, lid: string, patch: Partial<Lesson>) {
    setCourse((c) => c ? {
      ...c,
      modules: c.modules.map((m) => m.id === mid
        ? { ...m, lessons: m.lessons.map((l) => l.id === lid ? { ...l, ...patch } : l) }
        : m),
    } : c);
  }
  function removeLesson(mid: string, lid: string) {
    setCourse((c) => c ? {
      ...c,
      modules: c.modules.map((m) => m.id === mid ? { ...m, lessons: m.lessons.filter((l) => l.id !== lid) } : m),
    } : c);
  }
  function removeModule(mid: string) {
    setCourse((c) => c ? { ...c, modules: c.modules.filter((m) => m.id !== mid) } : c);
  }

  const enrolledStudents = useMemo(() => demoStore.listProgressForCourse(course.id), [course.id]);
  const instructor = demoStore.listAllUsers().find((u) => u.id === course.instructorId);
  const moduleIds = course.modules.map((m) => `mod:${m.id}`);

  return (
    <AppShell pageEyebrow="Course editor">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-largeTitle leading-tight">{course.title}</h1>
          <p className="mt-1 text-footnote text-ink-mute num">/{course.slug} · {formatNumber(enrolledStudents.length)} enrolled</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={course.published ? 'outline' : 'terra'} onClick={() => { demoStore.togglePublished(course.id); setCourse((c) => c ? { ...c, published: !c.published } : c); toast.success(course.published ? 'Unpublished.' : 'Published.'); }}>
            {course.published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="terra" onClick={save} data-tour="save-course"><Save className="size-4" /> Save</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Editor body */}
        <div>
          <div className="rounded-md border border-rule bg-paper-soft p-6">
            <p className="eyebrow">Metadata</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-footnote text-ink-soft">Title</label>
                <Input value={course.title} onChange={(e) => updateMeta({ title: e.target.value, slug: slugify(e.target.value) })} className="mt-1.5" />
              </div>
              <div>
                <label className="text-footnote text-ink-soft">Subtitle</label>
                <Input value={course.subtitle ?? ''} onChange={(e) => updateMeta({ subtitle: e.target.value })} className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <label className="text-footnote text-ink-soft">Description</label>
                <Textarea value={course.description} onChange={(e) => updateMeta({ description: e.target.value })} className="mt-1.5 min-h-32" />
              </div>
              <div>
                <label className="text-footnote text-ink-soft">Tier</label>
                <select
                  value={course.tier}
                  onChange={(e) => updateMeta({ tier: e.target.value as any })}
                  className="mt-1.5 h-11 w-full rounded-md border border-rule bg-paper px-3 text-body"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="team">Team</option>
                </select>
              </div>
              <div>
                <label className="text-footnote text-ink-soft">Cover image URL</label>
                <Input value={course.coverImage} onChange={(e) => updateMeta({ coverImage: e.target.value })} className="mt-1.5" />
              </div>
            </div>
          </div>

          {/* Modules with drag-and-drop */}
          <div className="mt-8" data-tour="modules">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Outline</p>
              <Button variant="outline" size="sm" onClick={addModule}><Plus className="size-3" /> Add module</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
                <div className="mt-4 space-y-4">
                  {course.modules.map((m, mi) => (
                    <SortableModule
                      key={m.id}
                      module={m}
                      idx={mi}
                      onChange={(p) => updateModule(m.id, p)}
                      onRemove={() => removeModule(m.id)}
                      onAddLesson={(t) => addLesson(m.id, t)}
                      onLessonChange={(lid, patch) => updateLesson(m.id, lid, patch)}
                      onLessonRemove={(lid) => removeLesson(m.id, lid)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Sidebar — instructor + students */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {instructor && (
            <div className="rounded-md border border-rule bg-paper-soft p-5">
              <p className="eyebrow">Author</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={instructor.avatarUrl} alt="" />
                  <AvatarFallback>{initials(instructor.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-title3 leading-tight">{instructor.displayName}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border border-rule bg-paper-soft p-5" data-tour="aggregate">
            <p className="eyebrow">Aggregate progress</p>
            <p className="mt-2 font-display text-title1 leading-none num">{formatNumber(enrolledStudents.length)}</p>
            <p className="mt-1 text-caption text-ink-mute">enrolled</p>
            <ul className="mt-4 space-y-2 text-footnote">
              {enrolledStudents.slice(0, 6).map((p) => {
                const u = demoStore.listAllUsers().find((x) => x.id === p.userId);
                return (
                  <li key={p.userId} className="flex items-center justify-between">
                    <span className="truncate">{u?.displayName ?? 'User'}</span>
                    <span className="num text-ink-mute">{Math.round(p.percentComplete * 100)}%</span>
                  </li>
                );
              })}
              {enrolledStudents.length === 0 && <p className="text-ink-mute">No enrollments yet.</p>}
            </ul>
          </div>

          <Badge>{course.published ? 'Published' : 'Draft'}</Badge>
        </aside>
      </div>
    </AppShell>
  );
}

function SortableModule({
  module: m,
  idx,
  onChange,
  onRemove,
  onAddLesson,
  onLessonChange,
  onLessonRemove,
}: {
  module: Module;
  idx: number;
  onChange: (patch: Partial<Module>) => void;
  onRemove: () => void;
  onAddLesson: (t: 'video' | 'text' | 'quiz') => void;
  onLessonChange: (lid: string, patch: Partial<Lesson>) => void;
  onLessonRemove: (lid: string) => void;
}) {
  const sortable = useSortable({ id: `mod:${m.id}` });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const lessonIds = m.lessons.map((l) => `les:${m.id}:${l.id}`);
  return (
    <div ref={sortable.setNodeRef} style={style} className="rounded-md border border-rule bg-paper-soft p-5">
      <header className="flex items-center gap-3">
        <button {...sortable.attributes} {...sortable.listeners} className="cursor-grab text-ink-mute hover:text-ink">
          <GripVertical className="size-4" />
        </button>
        <span className="eyebrow num">Module {String(idx + 1).padStart(2, '0')}</span>
        <Input value={m.title} onChange={(e) => onChange({ title: e.target.value })} className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onRemove}><Trash2 className="size-3 text-danger" /></Button>
      </header>

      <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
        <div className="mt-4 space-y-2">
          {m.lessons.map((l) => (
            <SortableLesson
              key={l.id}
              moduleId={m.id}
              lesson={l}
              onChange={(p) => onLessonChange(l.id, p)}
              onRemove={() => onLessonRemove(l.id)}
            />
          ))}
        </div>
      </SortableContext>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onAddLesson('video')}><Plus className="size-3" /> Video lesson</Button>
        <Button variant="outline" size="sm" onClick={() => onAddLesson('text')}><Plus className="size-3" /> Text lesson</Button>
        <Button variant="outline" size="sm" onClick={() => onAddLesson('quiz')}><Plus className="size-3" /> Quiz</Button>
      </div>
    </div>
  );
}

function SortableLesson({
  moduleId,
  lesson,
  onChange,
  onRemove,
}: {
  moduleId: string;
  lesson: Lesson;
  onChange: (patch: Partial<Lesson>) => void;
  onRemove: () => void;
}) {
  const sortable = useSortable({ id: `les:${moduleId}:${lesson.id}` });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const [expanded, setExpanded] = useState(false);
  return (
    <div ref={sortable.setNodeRef} style={style} className="rounded-md border border-rule bg-paper p-3">
      <div className="flex items-center gap-2">
        <button {...sortable.attributes} {...sortable.listeners} className="cursor-grab text-ink-mute hover:text-ink">
          <GripVertical className="size-3.5" />
        </button>
        <Badge variant="outline" className="text-caption capitalize">{lesson.type}</Badge>
        <Input value={lesson.title} onChange={(e) => onChange({ title: e.target.value })} className="h-9 flex-1" />
        <Input
          type="number"
          min={1}
          value={lesson.durationMinutes}
          onChange={(e) => onChange({ durationMinutes: Number(e.target.value) || 0 })}
          className="h-9 w-20 num"
        />
        <Button variant="ghost" size="sm" onClick={() => setExpanded((s) => !s)}>{expanded ? '−' : '+'}</Button>
        <Button variant="ghost" size="sm" onClick={onRemove}><Trash2 className="size-3 text-danger" /></Button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-rule pt-3">
          <label className="flex items-center gap-2 text-footnote">
            <input
              type="checkbox"
              checked={lesson.isFreePreview}
              onChange={(e) => onChange({ isFreePreview: e.target.checked })}
            />
            Free preview
          </label>
          {lesson.type === 'video' && (
            <Input value={lesson.videoUrl ?? ''} onChange={(e) => onChange({ videoUrl: e.target.value })} placeholder="https://…/video.mp4" />
          )}
          {lesson.type === 'text' && (
            <Textarea
              value={lesson.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="min-h-40 font-mono text-footnote"
              placeholder="Lesson body — markdown."
            />
          )}
          {lesson.type === 'quiz' && (
            <p className="text-caption text-ink-mute">{lesson.questions?.length ?? 0} questions seeded. Edit in code or admin tools.</p>
          )}
        </div>
      )}
    </div>
  );
}
