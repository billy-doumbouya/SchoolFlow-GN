"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createClassSchema } from "@/schemas";
import { useFetch, useApi, usePagination } from "@/hooks";
import { toast } from "sonner";
import {
  Button,
  Card,
  Badge,
  Modal,
  Input,
  Select,
  Table,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  EmptyState,
  Pagination,
  LoadingPage,
  PageHeader,
  ConfirmModal,
} from "@/components/ui";

const CY = new Date().getFullYear();
const YEARS = [`${CY - 1}-${CY}`, `${CY}-${CY + 1}`, `${CY + 1}-${CY + 2}`];

export default function ClassesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { page, setPage, queryString } = usePagination();
  const { data, loading, refetch } = useFetch(`/classes?${queryString}`, [
    page,
  ]);
  const { data: tData } = useFetch("/teachers?limit=100");
  const { post, put, del, loading: saving } = useApi();
  const classes = data?.data ?? [];
  const teachers = tData?.data ?? [];
  const pagination = data?.pagination ?? null;

  async function handleSave(d) {
    try {
      if (editing) {
        await put(`/classes/${editing.id}`, d);
        toast.success("Classe mise à jour");
      } else {
        await post("/classes", d);
        toast.success("Classe créée");
      }
      setShowForm(false);
      setEditing(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await del(`/classes/${id}`);
      toast.success("Classe désactivée");
      setDeleting(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div style={{ padding: "32px", fontFamily: "DM Sans, sans-serif" }}>
      <PageHeader
        title="Classes"
        subtitle={`${pagination?.total ?? 0} classes actives`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvelle classe
          </Button>
        }
      />
      <Card>
        {loading ? (
          <LoadingPage />
        ) : classes.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Aucune classe"
            description="Créez votre première classe"
            action={
              <Button onClick={() => setShowForm(true)}>
                Créer une classe
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Classe</Th>
                <Th>Niveau</Th>
                <Th>Année</Th>
                <Th>Titulaire</Th>
                <Th>Effectif</Th>
                <Th>Capacité</Th>
                <Th></Th>
              </TableHead>
              <TableBody>
                {classes.map((c) => {
                  const enrolled = c._count?.enrollments ?? 0;
                  const pct = Math.round((enrolled / c.capacity) * 100);
                  const pctColor =
                    pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
                  return (
                    <Tr key={c.id}>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              background: "rgba(43,80,245,0.15)",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#93c5fd",
                              fontWeight: "800",
                              fontSize: "11px",
                              fontFamily: "Syne, sans-serif",
                            }}
                          >
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: "600",
                                color: "white",
                                fontSize: "13px",
                              }}
                            >
                              {c.name}
                            </p>
                            {c.section && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "11px",
                                  color: "#475569",
                                }}
                              >
                                Section {c.section}
                              </p>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant="brand">{c.level}</Badge>
                      </Td>
                      <Td>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {c.academicYear}
                        </span>
                      </Td>
                      <Td>
                        {c.teacher ? (
                          <span style={{ fontSize: "13px", color: "#e2e8f0" }}>
                            {c.teacher.user.firstName} {c.teacher.user.lastName}
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#334155" }}>
                            Non assigné
                          </span>
                        )}
                      </Td>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "white",
                              fontFamily: "Syne, sans-serif",
                            }}
                          >
                            {enrolled}
                          </span>
                          <div
                            style={{
                              width: "48px",
                              height: "4px",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                background: pctColor,
                                width: `${pct}%`,
                                borderRadius: "2px",
                                transition: "width 0.4s",
                              }}
                            />
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          {c.capacity}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => {
                              setEditing(c);
                              setShowForm(true);
                            }}
                            style={{
                              fontSize: "12px",
                              color: "#93c5fd",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontFamily: "DM Sans, sans-serif",
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => setDeleting(c)}
                            style={{
                              fontSize: "12px",
                              color: "#ef4444",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "DM Sans, sans-serif",
                            }}
                          >
                            Retirer
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>
      {showForm && (
        <Modal
          open
          title={editing ? "Modifier la classe" : "Nouvelle classe"}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <ClassForm
            cls={editing}
            teachers={teachers}
            saving={saving}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting?.id)}
        loading={saving}
        title="Désactiver cette classe ?"
        message={`La classe "${deleting?.name}" sera désactivée.`}
        confirmLabel="Désactiver"
      />
    </div>
  );
}

function ClassForm({ cls, teachers, saving, onSave, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createClassSchema),
    defaultValues: cls
      ? {
          name: cls.name,
          level: cls.level,
          section: cls.section,
          academicYear: cls.academicYear,
          teacherId: cls.teacherId,
          capacity: cls.capacity,
        }
      : { capacity: 30, academicYear: YEARS[1] },
  });
  return (
    <form
      onSubmit={handleSubmit(onSave)}
      style={{ display: "flex", flexDirection: "column", gap: "14px" }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
      >
        <Input
          label="Nom de la classe"
          required
          error={errors.name?.message}
          {...register("name")}
          placeholder="6ème A"
        />
        <Input
          label="Niveau"
          required
          error={errors.level?.message}
          {...register("level")}
          placeholder="6ème"
        />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
      >
        <Input
          label="Section"
          error={errors.section?.message}
          {...register("section")}
          placeholder="A"
        />
        <Select
          label="Année scolaire"
          required
          error={errors.academicYear?.message}
          {...register("academicYear")}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
      >
        <Select
          label="Enseignant titulaire"
          error={errors.teacherId?.message}
          {...register("teacherId")}
        >
          <option value="">Aucun</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.user.firstName} {t.user.lastName}
            </option>
          ))}
        </Select>
        <Input
          label="Capacité"
          type="number"
          error={errors.capacity?.message}
          {...register("capacity")}
          placeholder="30"
        />
      </div>
      <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
        <Button
          variant="secondary"
          type="button"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          Annuler
        </Button>
        <Button type="submit" loading={saving} style={{ flex: 1 }}>
          {cls ? "Enregistrer" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
