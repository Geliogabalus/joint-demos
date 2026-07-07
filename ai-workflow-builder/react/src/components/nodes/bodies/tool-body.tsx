import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { ToolNodeData } from '@/workflow/workflow-types';
import { Field } from '../node-field';
import { useNodeData } from '../use-node-data';

export function ToolBody({ data }: { readonly data: ToolNodeData }) {
    const patch = useNodeData<ToolNodeData>();
    return (
        <div className="space-y-2.5">
            <Field label="Subreddit">
                <div className="flex items-center rounded-md border border-input bg-background pl-2.5 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-xs text-muted-foreground">r/</span>
                    <Input
                        value={data.subreddit}
                        onChange={(event) => patch({ subreddit: event.target.value })}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                    />
                </div>
            </Field>

            <Field label={`Topic limit · ${data.limit}`}>
                <Slider
                    aria-label="Topic limit"
                    min={0}
                    max={10}
                    step={1}
                    value={[data.limit]}
                    onValueChange={([limit]) => patch({ limit })}
                />
            </Field>
        </div>
    );
}
