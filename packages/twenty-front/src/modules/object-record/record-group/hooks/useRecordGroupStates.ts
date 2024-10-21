import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordGroupDefinitionState } from '@/object-record/record-group/states/recordGroupDefinitionState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseRecordGroupStatesParams = {
  objectNameSingular: string;
};

export const useRecordGroupStates = ({
  objectNameSingular,
}: UseRecordGroupStatesParams) => {
  const recordIndexGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const selectableFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem.fields.filter(
        (field) => field.type === FieldMetadataType.Select,
      ),
    [objectMetadataItem.fields],
  );

  const viewGroupFieldMetadataItem = useMemo(() => {
    if (recordIndexGroupDefinitions.length === 0) return null;
    // We're assuming that all groups have the same fieldMetadataId for now
    const fieldMetadataId =
      'fieldMetadataId' in recordIndexGroupDefinitions[0]
        ? recordIndexGroupDefinitions[0].fieldMetadataId
        : null;

    if (!fieldMetadataId) return null;

    return objectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataId,
    );
  }, [objectMetadataItem, recordIndexGroupDefinitions]);

  const visibleRecordGroups = useMemo(
    () =>
      recordIndexGroupDefinitions
        .filter((boardGroup) => boardGroup.isVisible)
        .sort(
          (boardGroupA, boardGroupB) =>
            boardGroupA.position - boardGroupB.position,
        ),
    [recordIndexGroupDefinitions],
  );

  const hiddenRecordGroups = useMemo(
    () =>
      recordIndexGroupDefinitions.filter((boardGroup) => !boardGroup.isVisible),
    [recordIndexGroupDefinitions],
  );

  return {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
    selectableFieldMetadataItems,
  };
};
