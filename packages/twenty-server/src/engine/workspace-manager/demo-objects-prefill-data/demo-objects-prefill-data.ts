import { DataSource, EntityManager } from 'typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { companyPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/company';
import { opportunityPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/opportunity';
import { personPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/person';
import { workspaceMemberPrefillData } from 'src/engine/workspace-manager/demo-objects-prefill-data/workspace-member';
import { viewPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/view';

export const demoObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
  featureFlags?: FeatureFlagEntity[],
) => {
  const objectMetadataMap = objectMetadata.reduce((acc, object) => {
    acc[object.standardId ?? ''] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        acc[field.standardId ?? ''] = field.id;

        return acc;
      }, {}),
    };

    return acc;
  }, {});

  await workspaceDataSource.transaction(
    async (entityManager: EntityManager) => {
      await companyPrefillDemoData(entityManager, schemaName);
      await personPrefillDemoData(entityManager, schemaName);
      await opportunityPrefillDemoData(entityManager, schemaName);

      await viewPrefillData(entityManager, schemaName, objectMetadataMap, featureFlags);

      await workspaceMemberPrefillData(entityManager, schemaName);
    },
  );
};
