'use client';
import { useState } from 'react';
import { Button, DataTable, Dialog, TextField, Toast } from '@kurotch-homelab/forma-react';
import type { DataColumn } from '@kurotch-homelab/forma-react';

type Project = { id: string; name: string; owner: string };

// Render inside FormaBoundary; replace sample data with the application's data.
export default function FormaExample() {
  const [rows, setRows] = useState<Project[]>([
    { id: '1', name: 'サイト刷新', owner: '田中' },
    { id: '2', name: '業務フローの整理', owner: '佐藤' },
  ]);
  const [draft, setDraft] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const columns: DataColumn<Project>[] = [
    {
      key: 'name',
      header: '案件名',
      accessor: (row) => row.name,
      render: (row) => (
        <Button
          variant="ghost"
          onClick={() => {
            setDraft({ ...row });
            setError('');
            setOpen(true);
          }}
        >
          {row.name}
        </Button>
      ),
    },
    { key: 'owner', header: '担当者', accessor: (row) => row.owner },
  ];
  return (
    <section style={{ padding: 24, maxWidth: 1120, margin: 'auto' }}>
      <h1>案件一覧</h1>
      <p>進行中の仕事と担当者を確認します。</p>
      <DataTable
        label="案件一覧"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        selectable
        pageSize={10}
      />
      <Dialog title="案件を編集" open={open} onOpenChange={setOpen}>
        {draft && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.name.trim()) {
                setError('案件名を入力してください。');
                return;
              }
              setRows(
                rows.map((row) =>
                  row.id === draft.id ? { ...draft, name: draft.name.trim() } : row,
                ),
              );
              setOpen(false);
              setSaved(true);
            }}
          >
            <TextField
              label="案件名"
              name="name"
              required
              value={draft.name}
              error={error}
              onValueChange={(name) => {
                setDraft({ ...draft, name });
                setError('');
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <Button onClick={() => setOpen(false)}>キャンセル</Button>
              <Button type="submit" variant="primary">
                保存
              </Button>
            </div>
          </form>
        )}
      </Dialog>
      <Toast open={saved} onOpenChange={setSaved}>
        変更を保存しました
      </Toast>
    </section>
  );
}
