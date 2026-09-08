export interface WorkflowActions {
  /* @oods-domain-action handleCancel sha256:2fda9aaf940793bebe7ee0cf90352fd9f7f14800f097699cc5fa1fc13a52c245 */
  /* @oods-domain-source sha256:a340cc3e4279d3b55f8af9f92525c31976c6714edbafc6a842629011926a9688 */
  /* @oods-domain-source sha256:69323b322fa7cc4de6d1e5ba24b1cb5d4e8bd16c5ddaccc70fb81140ceef8285 */
  handleCancel: () => void;
  /* @oods-domain-action handleChange sha256:c46018233b93999dbd0f1d8227f6ab08c0a480308d1a527bbbb8773150e1df87 */
  /* @oods-domain-source sha256:31385ba35f69645a2fd5e471f4cf1afbd3b6356b9459e1e80123bbc284955ba3 */
  handleChange: () => void;
  /* @oods-domain-action handleDelete sha256:e958fc4dbee224e7fa8a18179149f2c767ffe34192f16926cabd8ccb54ea7160 */
  /* @oods-domain-source sha256:5b51d6d668874eeceb4de2326434d8cd762aee730fb9a50bcdcd2b9697a71b6e */
  handleDelete: () => void;
  /* @oods-domain-action handleEdit sha256:182384d13b6b98a724f3da849699c7366e6563e36e5d43b4a0e193875662bc50 */
  /* @oods-domain-source sha256:e0774f642e1a26ebce8a8d9dae8da4a509838d11a3f255381068363bb2920c5a */
  handleEdit: () => void;
  /* @oods-domain-action handleFilter sha256:3caa4ca45751d5f98ecb9ca5b3bad67dae3648851ba5c81266abe239c327333e */
  /* @oods-domain-source sha256:dcd80e5df82a87effadc835ba3ee01b87b8f94956dd248f3916e4caea4eeaee2 */
  handleFilter: (criteria: Record<string, unknown>) => void;
  /* @oods-domain-action handleRowClick sha256:ceae6f55efc7d37856f8f7289091cfbaf7a9e975d11de5d12d3c0cad4486b910 */
  /* @oods-domain-source sha256:40f1128b9a619913b31806b44fb2798a64ee2fe80586edfbd8c637eb690790e1 */
  handleRowClick: (rowId: string) => void;
  /* @oods-domain-action handleSort sha256:7e0b149250c324d6472b9703e8d2a0e89c0ea2a39f11ac7bdfab83da38f9607b */
  /* @oods-domain-source sha256:1d35bd28d115ccb4e75fd245375fc8db7b06af97b029755330560fdbc0a86211 */
  handleSort: (column: string) => void;
  /* @oods-domain-action handleSubmit sha256:2f6aa5a9b7d11a3da9990fa83c008344c4ccae92969fb06db5ed068195a26871 */
  /* @oods-domain-source sha256:2774690c84b88d282fa52995d82608d30054d91e7730e9b770103035c2565545 */
  handleSubmit: () => void;
  /* @oods-domain-action handleViewTimeline sha256:77fdf70710dad3e639537244fdc3c3a64e330b99b0cb1427d79f38c14ebf78fe */
  /* @oods-domain-source sha256:ff23e1f2f34ea61a383aabf23a73f205422002045d7cd5f98aec63fc98ee9b6c */
  handleViewTimeline: () => void;
}
