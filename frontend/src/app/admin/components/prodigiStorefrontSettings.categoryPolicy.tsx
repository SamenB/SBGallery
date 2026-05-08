import type {
  CategoryDraft,
  StorefrontSettingsPayload,
} from "./prodigiStorefrontSettings.shared";
import { FieldLabel, JsonField } from "./prodigiStorefrontSettings.ui";

export function CategoryPolicyList({
  payload,
  categoryIds,
  categoryDrafts,
  updateCategoryDraft,
}: {
  payload: StorefrontSettingsPayload;
  categoryIds: string[];
  categoryDrafts: Record<string, CategoryDraft>;
  updateCategoryDraft: (
    categoryId: string,
    key: keyof CategoryDraft,
    value: string,
  ) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-bold">Category Storefront Policy</h3>
        <p className="mt-1 text-xs font-semibold text-[#31323E]/45">
          Fixed attributes, recommended defaults, allowed options, and visible
          shipping method hints.
        </p>
      </div>
      {categoryIds.map((categoryId) => {
        const policy = payload.effective.category_policy[categoryId];
        const draft = categoryDrafts[categoryId];
        if (!draft) return null;
        return (
          <div
            key={categoryId}
            className="rounded-lg border border-[#31323E]/10 p-4"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-base font-bold">{policy.label}</h4>
              <span className="text-xs font-bold text-[#31323E]/40">
                {categoryId}
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <JsonField
                label="Fixed Attributes"
                value={draft.fixed}
                onChange={(value) =>
                  updateCategoryDraft(categoryId, "fixed", value)
                }
              />
              <JsonField
                label="Recommended Defaults"
                value={draft.recommended}
                onChange={(value) =>
                  updateCategoryDraft(categoryId, "recommended", value)
                }
              />
              <JsonField
                label="Allowed Attributes"
                value={draft.allowed}
                onChange={(value) =>
                  updateCategoryDraft(categoryId, "allowed", value)
                }
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <FieldLabel label="Visible Methods">
                <input
                  value={draft.visibleMethods}
                  onChange={(event) =>
                    updateCategoryDraft(
                      categoryId,
                      "visibleMethods",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
                />
              </FieldLabel>
              <FieldLabel label="Preferred Order">
                <input
                  value={draft.preferredOrder}
                  onChange={(event) =>
                    updateCategoryDraft(
                      categoryId,
                      "preferredOrder",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
                />
              </FieldLabel>
              <FieldLabel label="Default Method">
                <input
                  value={draft.defaultMethod}
                  onChange={(event) =>
                    updateCategoryDraft(
                      categoryId,
                      "defaultMethod",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
                />
              </FieldLabel>
            </div>
          </div>
        );
      })}
    </section>
  );
}
