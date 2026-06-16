"use client";

import React from "react";
import {
  CreateTrainerRequest,
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
  Trainer,
  mergeTrainerSelectOptions,
} from "@/services/trainerService";
import MultiSelect from "@/shared/components/MultiSelect";
import TrainerChipSelect from "@/shared/components/trainer/TrainerChipSelect";
import TrainerPersonalDetailsFields from "@/shared/components/trainer/TrainerPersonalDetailsFields";
import TrainerQualificationFields from "@/shared/components/trainer/TrainerQualificationFields";
import TrainerProfileBanner from "@/shared/components/trainer/TrainerProfileBanner";
import { normalizeTrainerCategories } from "@/shared/utils/trainerCategoryUtils";
import "@/shared/styles/trainer-form.css";

type AdminTrainerFormSectionsProps = {
  formData: CreateTrainerRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTrainerRequest>>;
  editingTrainer: Trainer | null;
};

/**
 * Shared trainer form sections for admin CRM create/edit modals.
 *
 * @param props - Form state and optional existing trainer for banner display.
 */
const AdminTrainerFormSections: React.FC<AdminTrainerFormSectionsProps> = ({
  formData,
  setFormData,
  editingTrainer,
}) => {
  const patchDetails = (patch: Partial<CreateTrainerRequest>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  return (
    <>
      {editingTrainer ? (
        <TrainerProfileBanner
          name={formData.name || editingTrainer.name}
          title={formData.title || editingTrainer.title}
          email={(editingTrainer as Trainer & { email?: string }).email}
          mobile={(editingTrainer as Trainer & { mobile?: string }).mobile}
          category={normalizeTrainerCategories(formData.category)}
          profilePhoto={formData.profilePhoto ?? editingTrainer.profilePhoto}
        />
      ) : null}

      <div className="md:col-span-2">
        <TrainerChipSelect
          label="Category"
          options={[...TRAINER_CATEGORY_OPTIONS]}
          value={normalizeTrainerCategories(formData.category)}
          onChange={(selected) => setFormData((prev) => ({ ...prev, category: selected }))}
          required
          fieldId="admin-trainer-category"
        />
        <p className="text-muted text-xs mt-1 mb-0">
          Select all categories this trainer practices — they appear in each matching company section.
        </p>
      </div>

      <div className="md:col-span-2">
        <TrainerPersonalDetailsFields
          values={{
            dateOfBirth: formData.dateOfBirth,
            cities: formData.cities,
            pinCode: formData.pinCode,
            experience: formData.experience,
          }}
          onChange={patchDetails}
        />
      </div>

      <div>
        <MultiSelect
          label="Training For"
          options={mergeTrainerSelectOptions(SPECIALIST_OPTIONS, formData.specialistIn)}
          value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
          onChange={(selected) => setFormData((prev) => ({ ...prev, specialistIn: selected }))}
          placeholder="Select audience..."
          required
          maxHeight="200px"
        />
      </div>
      <div>
        <MultiSelect
          label="Specializations"
          options={mergeTrainerSelectOptions(TYPE_OF_TRAINING_OPTIONS, formData.typeOfTraining)}
          value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
          onChange={(selected) => setFormData((prev) => ({ ...prev, typeOfTraining: selected }))}
          placeholder="Select specializations..."
          required
          maxHeight="300px"
        />
      </div>

      <div className="md:col-span-2">
        <TrainerQualificationFields
          education={formData.education}
          certification={formData.certification}
          onChange={patchDetails}
        />
      </div>

      <div className="md:col-span-2">
        <label className="form-label flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.acceptingBookings !== false}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, acceptingBookings: e.target.checked }))
            }
            aria-label="Accepting new company bookings"
          />
          Accepting new company bookings
        </label>
      </div>
    </>
  );
};

export default AdminTrainerFormSections;
