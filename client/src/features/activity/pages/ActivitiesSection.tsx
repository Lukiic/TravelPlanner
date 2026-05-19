import { useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import Modal from '../../ui/components/Modal';
import Spinner from '../../ui/components/Spinner';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import type { Activity } from '../types/Activity';
import type { CreateActivityRequest } from '../types/CreateActivityRequest';
import ActivityCalendar from '../components/ActivityCalendar';
import type { IActivityApi } from '../api/IActivityApi';


type View = 'list' | 'calendar';

interface ActivitiesState {
    activities: Activity[];
    loading: boolean;
    view: View;
    modalOpen: boolean;
    editing: Activity | null;
    deleteTarget: string | null;
    saving: boolean;
    deleting: boolean;
}

type ActivitiesAction =
    | { type: 'LOAD_SUCCESS'; payload: Activity[] }
    | { type: 'LOAD_ERROR' }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'OPEN_ADD' }
    | { type: 'OPEN_EDIT'; payload: Activity }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SAVE_START' }
    | { type: 'SAVE_SUCCESS_ADD'; payload: Activity }
    | { type: 'SAVE_SUCCESS_EDIT'; payload: Activity }
    | { type: 'SAVE_ERROR' }
    | { type: 'SET_DELETE_TARGET'; payload: string | null }
    | { type: 'DELETE_START' }
    | { type: 'DELETE_SUCCESS'; payload: string }
    | { type: 'DELETE_ERROR' };

const initialState: ActivitiesState = {
    activities: [],
    loading: true,
    view: 'list',
    modalOpen: false,
    editing: null,
    deleteTarget: null,
    saving: false,
    deleting: false,
};

function activitiesReducer(state: ActivitiesState, action: ActivitiesAction): ActivitiesState {
    switch (action.type) {
        case 'LOAD_SUCCESS':
            return { ...state, loading: false, activities: action.payload };
        case 'LOAD_ERROR':
            return { ...state, loading: false };
        case 'SET_VIEW':
            return { ...state, view: action.payload };
        case 'OPEN_ADD':
            return { ...state, modalOpen: true, editing: null };
        case 'OPEN_EDIT':
            return { ...state, modalOpen: true, editing: action.payload };
        case 'CLOSE_MODAL':
            return { ...state, modalOpen: false, editing: null };
        case 'SAVE_START':
            return { ...state, saving: true };
        case 'SAVE_SUCCESS_ADD':
            return { ...state, saving: false, activities: [...state.activities, action.payload] };
        case 'SAVE_SUCCESS_EDIT':
            return {
                ...state,
                saving: false,
                activities: state.activities.map(a =>
                    a.id === action.payload.id ? action.payload : a
                ),
            };
        case 'SAVE_ERROR':
            return { ...state, saving: false };
        case 'SET_DELETE_TARGET':
            return { ...state, deleteTarget: action.payload };
        case 'DELETE_START':
            return { ...state, deleting: true };
        case 'DELETE_SUCCESS':
            return {
                ...state,
                deleting: false,
                deleteTarget: null,
                activities: state.activities.filter(a => a.id !== action.payload),
            };
        case 'DELETE_ERROR':
            return { ...state, deleting: false, deleteTarget: null };
        default:
            return state;
    }
}

interface ActivitiesSectionProps {
    planId: string;
    readOnly?: boolean;
    onActivityUpdate?: (id: string, data: Partial<CreateActivityRequest>) => Promise<Activity>;
    travelPlanStartDate?: string;
    travelPlanEndDate?: string;
    activityApi: IActivityApi;
}

export default function ActivitiesSection({
    planId,
    readOnly = false,
    onActivityUpdate,
    travelPlanStartDate,
    travelPlanEndDate,
    activityApi
}: ActivitiesSectionProps) {
    const [state, dispatch] = useReducer(activitiesReducer, initialState);
    const { activities, loading, view, modalOpen, editing, deleteTarget, saving, deleting } = state;


    useEffect(() => {
        activityApi
            .getAll(planId)
            .then(data => dispatch({ type: 'LOAD_SUCCESS', payload: data }))
            .catch(() => {
                toast.error('Failed to load activities');
                dispatch({ type: 'LOAD_ERROR' });
            });
    }, [planId]);

    const openAdd = () => dispatch({ type: 'OPEN_ADD' });
    const openEdit = (activity: Activity) => dispatch({ type: 'OPEN_EDIT', payload: activity });
    const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });

    const handleSubmit = async (data: CreateActivityRequest) => {
        dispatch({ type: 'SAVE_START' });
        try {
            if (editing) {
                const updated = onActivityUpdate
                    ? await onActivityUpdate(editing.id, data)
                    : await activityApi.update(planId, editing.id, data);
                dispatch({ type: 'SAVE_SUCCESS_EDIT', payload: updated });
                toast.success('Activity updated!');
            } else {
                const created = await activityApi.create(planId, data);
                dispatch({ type: 'SAVE_SUCCESS_ADD', payload: created });
                toast.success('Activity added!');
            }
            closeModal();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save activity');
            dispatch({ type: 'SAVE_ERROR' });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        dispatch({ type: 'DELETE_START' });
        try {
            await activityApi.delete(planId, deleteTarget);
            dispatch({ type: 'DELETE_SUCCESS', payload: deleteTarget });
            toast.success('Activity removed');
        } catch {
            toast.error('Failed to delete activity');
            dispatch({ type: 'DELETE_ERROR' });
        }
    };


    if (loading) return <Spinner />;

    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
                {/* View toggle */}
                <div className="flex items-center bg-navy-800 rounded-lg p-1 gap-1">
                    {(['list', 'calendar'] as View[]).map(v => (
                        <button
                            key={v}
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: v })}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${view === v
                                ? 'bg-navy-700 text-white'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {v === 'list' ? '☰ List' : '📅 Calendar'}
                        </button>
                    ))}
                </div>

                {!readOnly && (
                    <Button onClick={openAdd}>+ Add Activity</Button>
                )}
            </div>

            {/* Content */}
            {view === 'list' ? (
                <ActivityList
                    activities={activities}
                    onEdit={openEdit}
                    onDelete={(id) => dispatch({ type: 'SET_DELETE_TARGET', payload: id })}
                    readOnly={readOnly}
                />
            ) : (
                <ActivityCalendar
                    activities={activities}
                    onSelectActivity={readOnly ? () => { } : openEdit}
                    readOnly={readOnly}
                />
            )}

            {/* Modal */}
            {!readOnly && (
                <Modal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    title={editing ? 'Edit Activity' : 'Add Activity'}
                    size="md"
                >
                    <ActivityForm
                        initialValues={editing ?? undefined}
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        loading={saving}
                        travelPlanStartDate={travelPlanStartDate}
                        travelPlanEndDate={travelPlanEndDate}
                    />
                </Modal>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => dispatch({ type: 'SET_DELETE_TARGET', payload: null })}
                onConfirm={handleDelete}
                loading={deleting}
                title="Remove activity?"
                message="This activity will be permanently deleted."
            />
        </div>
    );
}