            );
        }

return NextResponse.json({ success: true });
    } catch (error: any) {
    console.error("Error in /api/updateIdea:", error);
    return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
    );
}
}
