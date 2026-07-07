import logoUrl from '@/assets/jointjs-logo.svg';

/** The JointJS+ wordmark + app name in the top-left of the toolbar. */
export function Brand() {
    return (
        <div className="flex items-center gap-2.5 pr-1">
            <img src={logoUrl} alt="JointJS+" className="h-5 w-auto" />
            <span className="hidden text-sm font-semibold text-foreground sm:inline">
        AI Workflow Builder
            </span>
        </div>
    );
}
